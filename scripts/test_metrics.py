import json
import pandas as pd
import numpy as np

with open("backend/data/cache/fuelhh_wind_jan2026.json", "r", encoding="utf-8") as f:
    actuals = json.load(f)
with open("backend/data/cache/windfor_jan2026.json", "r", encoding="utf-8") as f:
    forecasts = json.load(f)

# Convert actuals
df_act = pd.DataFrame(actuals)
df_act["startTime"] = pd.to_datetime(df_act["startTime"])
df_act = df_act[(df_act["startTime"] >= "2026-01-01T00:00:00Z") & (df_act["startTime"] < "2026-02-01T00:00:00Z")]

# Convert forecasts
df_fc = pd.DataFrame(forecasts)
df_fc["startTime"] = pd.to_datetime(df_fc["startTime"])
df_fc["publishTime"] = pd.to_datetime(df_fc["publishTime"])

# Test 11:00 AM Gate Closure D-1
results = []
for dt, group in df_fc.groupby(df_fc["startTime"].dt.date):
    if dt < pd.to_datetime("2026-01-01").date() or dt > pd.to_datetime("2026-01-31").date():
        continue
    gate_closure = pd.to_datetime(dt).tz_localize("UTC") - pd.Timedelta(days=1) + pd.Timedelta(hours=11)
    valid = group[group["publishTime"] <= gate_closure]
    for st, st_group in valid.groupby("startTime"):
        latest = st_group.sort_values("publishTime").iloc[-1]
        results.append({
            "startTime": latest["startTime"],
            "forecast_da": latest["generation"],
            "publishTime_da": latest["publishTime"],
            "gate_closure": gate_closure
        })

df_da = pd.DataFrame(results)
print("Aligned DA records count:", len(df_da))

# Resample actuals to hourly mean
df_act_hourly = df_act.set_index("startTime").resample("1h")["generation"].mean().reset_index()
df_act_hourly.rename(columns={"generation": "actual"}, inplace=True)

df_merged = pd.merge(df_act_hourly, df_da, on="startTime", how="inner")
print("Merged records count:", len(df_merged))

df_merged["error"] = df_merged["forecast_da"] - df_merged["actual"]
df_merged["abs_error"] = df_merged["error"].abs()

mae = float(df_merged["abs_error"].mean())
rmse = float(np.sqrt((df_merged["error"]**2).mean()))
wape = float((df_merged["abs_error"].sum() / df_merged["actual"].sum()) * 100)
bias = float(df_merged["error"].mean())

print("=== January 2026 UK Wind DA Forecast Accuracy (Gate 11:00 D-1) ===")
print("Mean Actual Wind:", round(float(df_merged["actual"].mean()), 1), "MW")
print("Mean DA Forecast:", round(float(df_merged["forecast_da"].mean()), 1), "MW")
print("MAE: ", round(mae, 1), "MW")
print("RMSE:", round(rmse, 1), "MW")
print("WAPE:", round(wape, 2), "%")
print("Bias:", round(bias, 1), "MW")
print("Max Over-forecast (Short Risk): ", round(float(df_merged["error"].max()), 1), "MW")
print("Max Under-forecast (Long Risk):", round(float(df_merged["error"].min()), 1), "MW")
print("P10 Error:", round(float(df_merged["error"].quantile(0.10)), 1), "MW")
print("P50 Error:", round(float(df_merged["error"].quantile(0.50)), 1), "MW")
print("P90 Error:", round(float(df_merged["error"].quantile(0.90)), 1), "MW")
