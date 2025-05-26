export default function HealthPage() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1>✅ Health Check OK</h1>
        <p>Status: Healthy</p>
        <p>Timestamp: {new Date().toISOString()}</p>
        <p>Service: palpite-f1-frontend</p>
      </div>
    </div>
  );
} 