import { aiService } from '../modules/aiService.js';
import AIDiagnostic from '../models/AIDiagnostic.js';

/**
 * AI Controller
 * Manages AI operations for Admin/Client
 */
export const getAIStats = async (req, res) => {
  try {
    const errorCount = await AIDiagnostic.countDocuments({ status: 'Open' });
    const resolvedCount = await AIDiagnostic.countDocuments({ status: 'Resolved' });
    const diagnostics = await AIDiagnostic.find().sort({ timestamp: -1 }).limit(10);

    res.status(200).json({
      status: 'success',
      data: {
        errorCount,
        resolvedCount,
        diagnostics
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getDiagnosticDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const diagnostic = await AIDiagnostic.findById(id);
    if (!diagnostic) {
      return res.status(404).json({ status: 'error', message: 'Diagnostic not found' });
    }
    res.status(200).json({ status: 'success', data: diagnostic });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const generateDescription = async (req, res) => {
  try {
    const { details } = req.body;
    const description = await aiService.generatePropertyDescription(details);
    res.status(200).json({ status: 'success', data: description });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const analyzeLeadIntent = async (req, res) => {
  try {
    const { inquiry } = req.body;
    const insight = await aiService.analyzeLead({ inquiry });
    res.status(200).json({ status: 'success', data: insight });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const searchParse = async (req, res) => {
  try {
    const { query, userLocation } = req.body;
    const searchParams = await aiService.parseNaturalLanguageSearch(query, userLocation);
    res.status(200).json({ status: 'success', data: searchParams });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const resolveDiagnostic = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const diagnostic = await AIDiagnostic.findByIdAndUpdate(id, { status, resolvedAt: new Date() }, { new: true });
    res.status(200).json({ status: 'success', data: diagnostic });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const analyzeCode = async (req, res) => {
  try {
    const { query } = req.body;
    const analysis = await aiService.analyzeCodebase(query);
    res.status(200).json({ status: 'success', data: analysis });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const applyFix = async (req, res) => {
  try {
    const { filePath, oldCode, newCode, diagnosticId } = req.body;
    const result = await aiService.applyFilePatch(filePath, oldCode, newCode);
    
    if (result.success && diagnosticId) {
      await AIDiagnostic.findByIdAndUpdate(diagnosticId, { status: 'Resolved', resolvedAt: new Date() });
    }
    
    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
