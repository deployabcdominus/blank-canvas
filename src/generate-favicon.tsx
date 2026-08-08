import React from 'react';
import { Layers } from 'lucide-react';

const FaviconGenerator = () => {
  return (
    <div 
      id="favicon-source"
      style={{
        width: '512px',
        height: '512px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#09090b', // Zinc-950
        position: 'relative',
        color: '#ffffff',
        borderRadius: '64px',
        overflow: 'hidden'
      }}
    >
      {/* Absolute elements for technical variant */}
      <div style={{
        position: 'absolute',
        inset: '0',
        border: '16px solid currentColor',
        opacity: '0.2',
        borderRadius: '8px'
      }} />
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        width: '64px',
        height: '64px',
        borderTop: '16px solid #8b5cf6', // Violet-500 (Primary)
        borderLeft: '16px solid #8b5cf6'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '0',
        right: '0',
        width: '64px',
        height: '64px',
        borderBottom: '16px solid #8b5cf6',
        borderRight: '16px solid #8b5cf6'
      }} />
      
      <Layers style={{ width: '256px', height: '256px' }} strokeWidth={2.5} />
    </div>
  );
};

export default FaviconGenerator;
