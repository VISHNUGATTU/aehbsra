import React from 'react';

export default function MetricCard({
  title,
  value,
  unit,
  subtitle,
  badgeText,
  badgeType = 'blue', // 'blue', 'green', 'yellow', 'orange', 'red'
  icon: Icon
}) {
  // Normalize badge type to strict 5 colors
  const normalizedType = {
    cyan: 'blue',
    blue: 'blue',
    purple: 'blue',
    indigo: 'blue',
    green: 'green',
    emerald: 'green',
    yellow: 'yellow',
    amber: 'yellow',
    orange: 'orange',
    red: 'red',
    rose: 'red'
  }[badgeType] || 'blue';

  const badgeClass = `badge-${normalizedType}`;

  const colorMap = {
    blue: {
      accent: 'var(--blue)',
      iconBg: 'var(--blue-soft)',
      iconBorder: 'var(--blue-border)',
      iconColor: 'var(--blue-dark)'
    },
    green: {
      accent: 'var(--green)',
      iconBg: 'var(--green-soft)',
      iconBorder: 'var(--green-border)',
      iconColor: 'var(--green-dark)'
    },
    yellow: {
      accent: 'var(--yellow)',
      iconBg: 'var(--yellow-soft)',
      iconBorder: 'var(--yellow-border)',
      iconColor: 'var(--yellow-dark)'
    },
    orange: {
      accent: 'var(--orange)',
      iconBg: 'var(--orange-soft)',
      iconBorder: 'var(--orange-border)',
      iconColor: 'var(--orange-dark)'
    },
    red: {
      accent: 'var(--red)',
      iconBg: 'var(--red-soft)',
      iconBorder: 'var(--red-border)',
      iconColor: 'var(--red-dark)'
    }
  }[normalizedType];

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '20px 22px', 
        position: 'relative', 
        background: '#FFFFFF',
        borderTop: `3px solid ${colorMap.accent}`,
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '138px'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ 
            fontSize: '11.5px', 
            fontWeight: 700, 
            color: 'var(--text-dim)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.05em' 
          }}>
            {title}
          </span>
          {Icon && (
            <div style={{ 
              width: '32px',
              height: '32px',
              borderRadius: '8px', 
              background: colorMap.iconBg, 
              color: colorMap.iconColor,
              border: `1px solid ${colorMap.iconBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Icon size={16} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
          <span className="mono-num" style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            color: 'var(--text-main)', 
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            {value}
          </span>
          {unit && (
            <span style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              color: 'var(--text-dim)', 
              fontFamily: 'var(--font-mono)' 
            }}>
              {unit}
            </span>
          )}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '12px', 
        paddingTop: '10px', 
        borderTop: '1px solid var(--border-subtle)',
        gap: '8px'
      }}>
        {subtitle && (
          <span style={{ 
            fontSize: '11.5px', 
            color: 'var(--text-dim)', 
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {subtitle}
          </span>
        )}
        {badgeText && (
          <span className={`badge-status ${badgeClass}`} style={{ flexShrink: 0 }}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
