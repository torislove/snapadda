import { useState, useEffect, useMemo, useRef } from 'react';
import { fetchProperties, createProperty, updateProperty, deleteProperty, uploadMedia } from '../../../services/api';
import { adminAIService } from '../../../services/aiService';
import { toast } from 'react-hot-toast';

export const usePropertyManager = () => {
  const [properties, setProperties] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [customFeatures, setCustomFeatures] = useState<{label: string, value: string}[]>([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [liveData, setLiveData] = useState<any>({});
  const [currentImageUrls, setCurrentImageUrls] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [priceUnit, setPriceUnit] = useState<'Total' | 'Lakhs' | 'Cr'>('Total');
  const [pricePerAcreUnit, setPricePerAcreUnit] = useState<'Total' | 'Lakhs' | 'Cr'>('Lakhs');
  const [agriAcres, setAgriAcres] = useState<number | string>('');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'cards'>('cards');
  const [realtorData, setRealtorData] = useState<any>({});
  const formTimeoutRef = useRef<any>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = () => {
    fetchProperties({ status: 'all' }).then((data: any) => {
      const p = data?.data || (Array.isArray(data) ? data : []);
      setProperties(p);
    }).catch((err: any) => {
      console.error("Database connection failed:", err);
      setProperties([]);
    });
  };

  const handleCloseForm = () => {
    setIsAdding(false);
    setIsEditing(false);
    setEditingProperty(null);
    setCustomFeatures([]);
    setIsVerified(false);
    setIsFeatured(false);
    setNewImageFiles([]);
    setCurrentImageUrls([]);
    setLiveData({});
    setPriceUnit('Total');
    setPricePerAcreUnit('Total');
    setAgriAcres('');
    setRealtorData({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (prop: any) => {
    setEditingProperty(prop);
    setCustomFeatures(prop.customFeatures || []);
    setIsVerified(prop.isVerified || false);
    setIsFeatured(prop.isFeatured || false);
    const existing = prop.images || (prop.image ? [prop.image] : []);
    setCurrentImageUrls(existing);
    setLiveData(prop);
    setRealtorData(prop.realtor || {});
    
    if (prop.price >= 10000000) setPriceUnit('Cr');
    else if (prop.price >= 100000) setPriceUnit('Lakhs');
    else setPriceUnit('Total');

    if (prop.pricePerAcre >= 10000000) setPricePerAcreUnit('Cr');
    else if (prop.pricePerAcre >= 100000) setPricePerAcreUnit('Lakhs');
    else setPricePerAcreUnit('Total');

    if (prop.type === 'Agricultural Land' && prop.totalAcres) {
      setAgriAcres(prop.totalAcres);
    }

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

  const getAgriTotalDecimal = () => Number(agriAcres) || 0;

  const agriAutoValuation = () => {
    const ta = getAgriTotalDecimal();
    const ppa = convertToValue(liveData.pricePerAcre || 0, pricePerAcreUnit);
    if (!ta || !ppa) return 0;
    return Math.round(ta * Number(ppa));
  };

  const handleGenerateAIDescription = async () => {
    if (!liveData.title || !liveData.location) {
      alert("Please enter a Title and Location first to help the AI.");
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const details = {
        title: liveData.title,
        location: liveData.location,
        type: liveData.type,
        price: liveData.price,
        features: customFeatures.map(f => f.label + ': ' + f.value).join(', ')
      };

      const description = await adminAIService.generate(
        `Generate description for ${liveData.title} in ${liveData.location}`,
        'description',
        details
      );
      
      if (description) {
        setLiveData((prev: any) => ({ ...prev, description }));
      }
    } catch (err) {
      console.error("AI Generation failed:", err);
      const fallback = `${liveData.title} located in ${liveData.location}. This premium ${liveData.type} offers exceptional value and strategic positioning in the Andhra market. Contact for details.`;
      setLiveData((prev: any) => ({ ...prev, description: fallback }));
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const propData: any = Object.fromEntries(formData.entries());
    
    propData.customFeatures = customFeatures;
    propData.isVerified = isVerified;
    propData.isFeatured = isFeatured;

    // Duplicate Detection (Simple Title + Location match)
    const isDuplicate = properties.some(p => 
      (p._id || p.id) !== (editingProperty?._id || editingProperty?.id) && 
      p.title?.toLowerCase().trim() === propData.title?.toLowerCase().trim() &&
      p.location?.toLowerCase().trim() === propData.location?.toLowerCase().trim()
    );

    if (isDuplicate && !window.confirm("A property with this exact title and location already exists. Do you want to save anyway?")) {
      setIsUploading(false);
      return;
    }

    try {
      // Filter out temporary blob previews — ONLY keep permanent Cloudinary/External URLs
      let uploadedUrls: string[] = currentImageUrls.filter(u => u.startsWith('http') && !u.startsWith('blob:'));
      
      if (newImageFiles.length > 0) {
        const uploadResult = await uploadMedia(newImageFiles);
        if (uploadResult.status === 'success') {
          uploadedUrls = [...uploadedUrls, ...uploadResult.data];
          toast.success(`${newImageFiles.length} media files uploaded!`);
        } else {
          throw new Error(uploadResult.message || 'Media server rejected the files');
        }
      }

      propData.price = convertToValue(propData.price, priceUnit);
      propData.pricePerAcre = convertToValue(propData.pricePerAcre, pricePerAcreUnit);

      if (liveData.type === 'Agricultural Land') {
        propData.totalAcres = getAgriTotalDecimal();
        if (!propData.price && propData.pricePerAcre && propData.totalAcres) {
          propData.price = Math.round(Number(propData.pricePerAcre) * Number(propData.totalAcres));
        }
      } else {
        propData.totalAcres = Number(propData.totalAcres) || 0;
      }

      const isVideoUrl = (url: string) => /\.(mp4|mov|webm|ogg)$/i.test(url) || url.includes('/video/');
      const imagesList = uploadedUrls.filter(url => !isVideoUrl(url) && url.startsWith('http'));
      const videosList = uploadedUrls.filter(url => isVideoUrl(url));

      propData.images = imagesList;
      propData.videos = videosList;
      propData.image = imagesList.length > 0 ? imagesList[0] : '';
      propData.videoUrl = videosList.length > 0 ? videosList[0] : '';
      
      const payload = {
        ...propData,
        customFeatures,
        isVerified,
        isFeatured,
        images: imagesList,
        image: imagesList.length > 0 ? imagesList[0] : '',
        realtor: realtorData,  // include realtor info
        // Always set Active for new listings
        status: isEditing ? (propData.status || 'Active') : 'Active',
      };

      if (isEditing && editingProperty) {
        await updateProperty(editingProperty._id || editingProperty.id, payload);
        toast.success("Listing updated!");
      } else {
        await createProperty(payload);
        toast.success("Listing published live!");
      }
      
      loadProperties();
      handleCloseForm();
    } catch (err: any) {
      console.error("Save failed:", err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    const updatedData: any = Object.fromEntries(formData.entries());
    
    if (formTimeoutRef.current) clearTimeout(formTimeoutRef.current);
    
    formTimeoutRef.current = setTimeout(() => {
      setLiveData((prev: any) => {
        const p = convertToValue(updatedData.price, priceUnit);
        const ppa = convertToValue(updatedData.pricePerAcre, pricePerAcreUnit);
        return { ...prev, ...updatedData, price: p, pricePerAcre: ppa };
      });
    }, 350);
  };

  const handleMediaChange = (urls: string[], files: File[]) => {
    setCurrentImageUrls(urls);
    setNewImageFiles(files);
  };

  const filteredProperties = useMemo(() => {
    if (!search) return properties;
    return properties.filter(p => {
      const keyword = search.toLowerCase();
      return (
        p.title?.toLowerCase().includes(keyword) || 
        p.location?.toLowerCase().includes(keyword) ||
        p.type?.toLowerCase().includes(keyword)
      );
    });
  }, [properties, search]);

  return {
    properties, filteredProperties,
    isAdding, setIsAdding,
    isEditing, setIsEditing,
    editingProperty, setEditingProperty,
    customFeatures, setCustomFeatures,
    isVerified, setIsVerified,
    isFeatured, setIsFeatured,
    isGeneratingAI, isUploading,
    liveData, setLiveData,
    currentImageUrls, setCurrentImageUrls,
    newImageFiles, setNewImageFiles,
    priceUnit, setPriceUnit,
    pricePerAcreUnit, setPricePerAcreUnit,
    agriAcres, setAgriAcres,
    search, setSearch,
    viewMode, setViewMode,
    loadProperties, handleCloseForm, handleEdit,
    handleGenerateAIDescription, handleAddSubmit, handleFormChange, handleMediaChange,
    agriAutoValuation, convertToValue, getAgriTotalDecimal,
    createProperty, updateProperty, deleteProperty,
    addCustomFeature: () => setCustomFeatures([...customFeatures, { label: '', value: '' }]),
    removeCustomFeature: (index: number) => setCustomFeatures(customFeatures.filter((_, i) => i !== index)),
    updateCustomFeature: (index: number, key: 'label' | 'value', val: string) => {
      const updated = [...customFeatures];
      updated[index][key] = val;
      setCustomFeatures(updated);
    },
    realtorData, setRealtorData,
  };
};
