import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { fetchProperties, createProperty, updateProperty, uploadMedia, fetchRealtors } from '../../../services/api';
import { adminAIService } from '../../../services/aiService';

export const usePropertyManager = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [customFeatures, setCustomFeatures] = useState<{label: string, value: string}[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isElite, setIsElite] = useState(false);
  const [isTrustVerified, setIsTrustVerified] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [liveData, setLiveData] = useState<any>({});
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [mediaSettings, setMediaSettings] = useState<{ url: string; objectFit: 'cover' | 'contain' }[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [priceUnit, setPriceUnit] = useState<'Total' | 'Lakhs' | 'Cr'>('Total');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('cards');
  const [realtorData, setRealtorData] = useState<any>({});
  const [realtors, setRealtors] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    bhk: '',
    status: 'all',
    purpose: ''
  });
  const formTimeoutRef = useRef<any>(null);

  const loadProperties = useCallback(async () => {
    try {
      const data = await fetchProperties({ ...filters, search });
      setProperties(data?.data || (Array.isArray(data) ? data : []));
    } catch {
      setProperties([]);
    }
  }, [filters, search]);

  const loadRealtorsList = useCallback(async () => {
    try {
      const data = await fetchRealtors();
      setRealtors(data || []);
    } catch {
      setRealtors([]);
    }
  }, []);

  useEffect(() => {
    loadProperties();
    loadRealtorsList();
  }, [loadProperties, loadRealtorsList]);

  const handleCloseForm = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingProperty(null);
    setCustomFeatures([]);
    setIsVerified(false);
    setIsFeatured(false);
    setIsElite(false);
    setIsTrustVerified(false);
    setNewImageFiles([]);
    setCurrentImageUrls([]);
    setMediaSettings([]);
    setLiveData({});
    setPriceUnit('Total');
    setRealtorData({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (prop: any) => {
    setEditingProperty(prop);
    setCustomFeatures(prop.customFeatures || []);
    setIsVerified(prop.isVerified || false);
    setIsFeatured(prop.isFeatured || false);
    setIsElite(prop.isElite || false);
    setIsTrustVerified(prop.isTrustVerified || false);
    setCurrentImageUrls(prop.images || (prop.image ? [prop.image] : []));
    setMediaSettings(prop.mediaSettings || []);
    setRealtorData(prop.realtor || {});
    
    let pUnit: 'Total' | 'Lakhs' | 'Cr' = 'Total';
    let pRaw = prop.price;
    if (prop.price >= 10000000) { pUnit = 'Cr'; pRaw = prop.price / 10000000; }
    else if (prop.price >= 100000) { pUnit = 'Lakhs'; pRaw = prop.price / 100000; }
    setPriceUnit(pUnit);

    setLiveData({ ...prop, price_raw: pRaw, priceType: prop.priceType || 'fixed' });
    setIsEditing(true);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const convertToValue = (val: number | string, unit: string) => {
    const n = Number(val) || 0;
    if (unit === 'Cr') return n * 10000000;
    if (unit === 'Lakhs') return n * 100000;
    return n;
  };

  const handleGenerateAIDescription = async () => {
    if (!liveData.title || !liveData.location) throw new Error("Title and Location required for AI context.");
    setIsGeneratingAI(true);
    try {
      const description = await adminAIService.generate(
        `Generate a professional bilingual real estate description for "${liveData.title}" in ${liveData.location}. 
         Include English and Telugu sections. Focus on investment potential and quality.`,
        'description',
        { title: liveData.title, location: liveData.location, type: liveData.type }
      );
      if (description) setLiveData((prev: any) => ({ ...prev, description }));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const formData = new FormData(e.currentTarget as HTMLFormElement);
      const propData: any = Object.fromEntries(formData.entries());
      
      let uploadedUrls: string[] = currentImageUrls.filter(u => u.startsWith('http') && !u.startsWith('blob:'));
      let finalMediaSettings = mediaSettings.filter(s => s.url.startsWith('http') && !s.url.startsWith('blob:'));

      if (newImageFiles.length > 0) {
        const uploadResult = await uploadMedia(newImageFiles);
        if (uploadResult.status === 'success') {
          const newUrls = uploadResult.data;
          uploadedUrls = [...uploadedUrls, ...newUrls];
          
          // Map blob URLs back to actual uploaded URLs in settings
          const blobToRealMap: Record<string, string> = {};
          const blobUrls = currentImageUrls.filter(u => u.startsWith('blob:'));
          blobUrls.forEach((blob, idx) => {
            if (newUrls[idx]) blobToRealMap[blob] = newUrls[idx];
          });

          const newSettings = mediaSettings.map(s => ({
            ...s,
            url: blobToRealMap[s.url] || s.url
          })).filter(s => s.url.startsWith('http'));
          
          finalMediaSettings = newSettings;
        }
      }

      const pVal = convertToValue(propData.price || liveData.price_raw, priceUnit);
      
      const payload = {
        ...propData,
        price: pVal,
        customFeatures,
        isVerified,
        isFeatured,
        isElite,
        isTrustVerified,
        images: uploadedUrls,
        image: uploadedUrls[0] || '',
        mediaSettings: finalMediaSettings,
        realtor: realtorData,
        displayContactType: liveData.displayContactType || 'Admin',
        status: isEditing ? (propData.status || 'Active') : 'Active',
      };

      if (isEditing && editingProperty) {
        await updateProperty(editingProperty._id || editingProperty.id, payload);
      } else {
        await createProperty(payload);
      }
      
      loadProperties();
      handleCloseForm();
      return true;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const updatedData: any = Object.fromEntries(formData.entries());
    if (formTimeoutRef.current) clearTimeout(formTimeoutRef.current);
    formTimeoutRef.current = setTimeout(() => {
      setLiveData((prev: any) => ({ ...prev, ...updatedData }));
    }, 150);
  };

  const filteredProperties = useMemo(() => {
    // With server-side filtering enabled, properties already match filters + search
    return properties;
  }, [properties]);

  return {
    properties, filteredProperties, isAdding, setIsAdding, isEditing, editingProperty,
    customFeatures, isVerified, setIsVerified, isFeatured, setIsFeatured, isElite, setIsElite,
    isTrustVerified, setIsTrustVerified, isGeneratingAI, isUploading, liveData, setLiveData,
    currentImageUrls, newImageFiles, priceUnit, setPriceUnit, search, setSearch, viewMode, setViewMode,
    filters, setFilters, updateFilter: (key: string, val: any) => setFilters(prev => ({ ...prev, [key]: val })),
    loadProperties, handleCloseForm, handleEdit, handleGenerateAIDescription, handleAddSubmit,
    handleFormChange, 
    handleMediaChange: (urls: string[], files: File[], settings: any[]) => { 
      setCurrentImageUrls(urls); 
      setNewImageFiles(files);
      setMediaSettings(settings);
    },
    mediaSettings,
    realtorData, setRealtorData, realtors, loadRealtors: loadRealtorsList,
    addCustomFeature: () => setCustomFeatures([...customFeatures, { label: '', value: '' }]),
    removeCustomFeature: (index: number) => setCustomFeatures(customFeatures.filter((_, i) => i !== index)),
    updateCustomFeature: (index: number, key: 'label' | 'value', val: string) => {
      const updated = [...customFeatures];
      updated[index][key] = val;
      setCustomFeatures(updated);
    },
    createProperty,
    updateProperty
  };
};
