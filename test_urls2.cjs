const https = require('https');
const urls = [
  'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
];

async function checkUrls() {
  for (const url of urls) {
    await new Promise((resolve) => {
      https.get(url, (res) => {
        console.log(url + ' => ' + res.statusCode);
        resolve();
      }).on('error', (e) => {
        console.error(url + ' => ' + e.message);
        resolve();
      });
    });
  }
}
checkUrls();
