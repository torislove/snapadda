import Busboy from 'busboy';

/**
 * Robust Hybrid Multipart Parser
 * Handles Firebase Functions (req.rawBody) and Local development (Express streams)
 */
export const parseMultipart = (req) => {
  return new Promise((resolve, reject) => {
    // 1. Firebase/GCP specific: Check for pre-parsed rawBody
    if (req.rawBody) {
      console.log('[PARSER] Detected Firebase rawBody. Using Busboy Buffer mode.');
      const busboy = Busboy({ headers: req.headers });
      const files = [];
      const fields = {};

      busboy.on('file', (name, file, info) => {
        const { filename, encoding, mimeType } = info;
        const chunks = [];
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => {
          files.push({
            fieldname: name,
            originalname: filename,
            encoding,
            mimetype: mimeType,
            buffer: Buffer.concat(chunks),
            size: Buffer.concat(chunks).length
          });
        });
      });

      busboy.on('field', (name, val) => {
        fields[name] = val;
      });

      busboy.on('finish', () => {
        req.files = files;
        req.body = fields;
        resolve({ files, fields });
      });

      busboy.on('error', (err) => reject(err));
      busboy.end(req.rawBody);
    } 
    // 2. Local development: Use the standard request stream
    else {
      console.log('[PARSER] No rawBody detected. Local mode active.');
      // Local mode usually relies on Multer middleware being called before the route handler.
      // If we are calling this manually, we can use busboy on the request stream.
      const busboy = Busboy({ headers: req.headers });
      const files = [];
      const fields = {};

      busboy.on('file', (name, file, info) => {
        const { filename, encoding, mimeType } = info;
        const chunks = [];
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => {
          files.push({
            fieldname: name,
            originalname: filename,
            encoding,
            mimetype: mimeType,
            buffer: Buffer.concat(chunks),
            size: Buffer.concat(chunks).length
          });
        });
      });

      busboy.on('field', (name, val) => {
        fields[name] = val;
      });

      busboy.on('finish', () => {
        req.files = files;
        req.body = fields;
        resolve({ files, fields });
      });

      busboy.on('error', (err) => reject(err));
      req.pipe(busboy);
    }
  });
};
