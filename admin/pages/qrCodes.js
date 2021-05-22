import React from 'react';
const QRCodeGenerator = require('qrcode.react');

const QRCodes = () => {
  const tables = [{ name: '1' }, { name: '2' }];
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '3vh' }}>
      {tables.map((x) => (
        <div style={{ textAlign: 'center' }}>
          <QRCodeGenerator
            value={`http://tmn-qr-commandes/react/${x.name}`}
            size={512}
            imageSettings={{
              src:
                'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fst2.depositphotos.com%2F4560635%2F8277%2Fv%2F950%2Fdepositphotos_82777174-stock-illustration-beer-logo-vector-illustration.jpg&f=1&nofb=1',
              x: null,
              y: null,
              height: 96,
              width: 96,
              excavate: true,
            }}
          />
          <h3>{`Table ${x.name}`}</h3>
        </div>
      ))}
    </div>
  );
};

export default QRCodes;
