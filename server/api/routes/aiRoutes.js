import express from 'express';
import { 
  getAIStats, getDiagnosticDetails, generateDescription, 
  analyzeLeadIntent, resolveDiagnostic, searchParse,
  analyzeCode, applyFix
} from '../controllers/aiController.js';

const router = express.Router();

router.get('/stats', getAIStats);
router.get('/diagnostic/:id', getDiagnosticDetails);
router.post('/diagnostic/:id/resolve', resolveDiagnostic);
router.post('/generate-description', generateDescription);
router.post('/analyze-lead', analyzeLeadIntent);
router.post('/search-parse', searchParse);

// Advanced AI Developer Endpoints
router.post('/analyze-code', analyzeCode);
router.post('/apply-fix', applyFix);

export default router;
