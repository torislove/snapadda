export default function handler(request, response) {
  response.status(200).json({
    status: 'success',
    message: 'Vercel Node.js Runtime is Alive and Balanced (Pure Diagnostic)',
    time: new Date().toISOString()
  });
}
