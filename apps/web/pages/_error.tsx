function Error({ statusCode }: { statusCode: number }) {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#000',
      color: '#fff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>
          {statusCode || 'Error'}
        </h1>
        <p style={{ fontSize: '18px', marginBottom: '32px' }}>
          {statusCode
            ? `An error ${statusCode} occurred on server`
            : 'An error occurred on client'}
        </p>
        <a 
          href="/" 
          style={{
            backgroundColor: '#facc15',
            color: '#000',
            padding: '12px 24px',
            borderRadius: '9999px',
            textDecoration: 'none',
            display: 'inline-block'
          }}
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;