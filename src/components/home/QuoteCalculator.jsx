'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Section from '@/components/layout/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import { useApi } from '@/components/providers/ApiProvider';
import { useMaterials } from '@/components/providers/SiteSettingsProvider';
import { parseModelFile, calculateQuote } from '@/lib/quote/calculateQuote';
import {
  saveCustomOrderFile,
  PENDING_CUSTOM_FILE_KEY,
} from '@/lib/quote/customOrderFileStore';
import { addCustomQuoteToCart } from '@/lib/quote/addCustomToCart';
import { loginPath } from '@/lib/auth-redirect';
import { useToast } from '@/components/providers/ToastProvider';

export const PENDING_CUSTOM_QUOTE_KEY = 'toolify_pending_custom_quote';

const ACCEPTED_TYPES = ['.stl', '.obj'];
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const THEMES = {
  light: {
    card: 'bg-white border border-border shadow-lg',
    upload: 'upload-dashed-light bg-alt-bg',
    uploadIcon: 'text-muted group-hover:text-brand',
    uploadText: 'text-muted group-hover:text-dark',
    uploadFileName: 'text-dark',
    uploadHint: 'text-muted',
    uploadOverlay: 'bg-white/70',
    label: 'text-muted',
    matInactive: 'border border-border bg-white hover:bg-alt-bg',
    matActive: 'border-2 border-brand bg-brand/5',
    matName: 'text-dark',
    matTag: 'text-muted',
    panel: 'bg-alt-bg border-2 border-brand',
    panelLabel: 'text-muted',
    rowLabel: 'text-text-secondary',
    rowValue: 'text-dark',
    divider: 'border-border',
    totalLabel: 'text-brand',
    totalCurrency: 'text-dark',
    totalAmount: 'text-dark',
    section: 'default',
    headerLight: false,
    gradient: 'from-brand/5',
  },
  dark: {
    card: 'bg-[#1A1A1A] border border-[#2A2A2A] shadow-2xl',
    upload: 'upload-dashed',
    uploadIcon: 'text-white/40 group-hover:text-brand',
    uploadText: 'text-white/40 group-hover:text-white',
    uploadFileName: 'text-white',
    uploadHint: 'text-white/40',
    uploadOverlay: 'bg-[#1A1A1A]/75',
    label: 'text-white/40',
    matInactive: 'border border-[#2A2A2A] bg-[#1A1A1A] hover:bg-[#2A2A2A]',
    matActive: 'border-2 border-brand bg-brand/10',
    matName: 'text-white',
    matTag: 'text-white/60',
    panel: 'bg-dark border-2 border-brand',
    panelLabel: 'text-white/40',
    rowLabel: 'text-white/60',
    rowValue: 'text-white',
    divider: 'border-[#2A2A2A]',
    totalLabel: 'text-brand',
    totalCurrency: 'text-white',
    totalAmount: 'text-white',
    section: 'dark',
    headerLight: true,
    gradient: 'from-primary/5',
  },
};

function estimatePrintTime(weight) {
  if (!weight) return null;
  const hours = Math.max(0.5, weight / 12);
  return `${hours.toFixed(1)} hrs`;
}

function buildQuotePayload(file, activeMaterial, volumeCm3, quote) {
  return {
    fileType: `.${file.name.split('.').pop()?.toLowerCase()}`,
    material: {
      id: activeMaterial.id,
      name: activeMaterial.fullName || activeMaterial.name,
    },
    volumeCm3,
    weight: quote?.estimatedWeight ?? null,
    pricePerGram: quote?.pricePerGram ?? activeMaterial.costPerGram,
    total: quote?.totalCost ?? 0,
  };
}

export default function QuoteCalculator({
  embedded = false,
  theme = 'light',
  showHeader = true,
  checkoutHref = '/dashboard',
  eyebrow = '// QUOTE_ENGINE_V1',
  title = 'Upload. Select. Get Price.',
  description = 'Drop your STL, pick a material, and get an instant estimate before checkout.',
  checkoutLabel = 'Add to Cart',
  className = '',
}) {
  const t = THEMES[theme] ?? THEMES.light;
  const router = useRouter();
  const pathname = usePathname();
  const { session, tokenReady, refreshCart } = useApi();
  const { showToast } = useToast();
  const { materials, discountsEnabled, weightBreakpointsG, loading: materialsLoading } = useMaterials();
  const fileInputRef = useRef(null);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [volumeCm3, setVolumeCm3] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    if (materials.length && !activeMaterial) {
      setActiveMaterial(materials[0]);
    }
  }, [materials, activeMaterial]);

  const quote = volumeCm3 && activeMaterial
    ? calculateQuote({
        volumeCm3,
        material: activeMaterial,
        discountsEnabled,
        weightBreakpointsG,
      })
    : null;
  const estimatedWeight = quote?.estimatedWeight ?? null;
  const totalPrice = quote?.totalCost ?? 0;
  const printTime = estimatePrintTime(estimatedWeight);

  const validateFile = (file) => {
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!ACCEPTED_TYPES.includes(extension)) {
      showToast('Only STL and OBJ files are supported.', 'error');
      return 'Only STL and OBJ files are supported.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Maximum file size is 50MB.';
    }
    return '';
  };

  const processFile = async (file) => {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      return;
    }

    setFileError('');
    setUploadedFile(file);
    setIsAnalyzing(true);
    setVolumeCm3(null);

    try {
      const { volumeCm3: parsedVolume } = await parseModelFile(file);
      setVolumeCm3(parsedVolume);
    } catch (err) {
      setUploadedFile(null);
      setFileError(err.message || 'Could not analyze this file.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePlaceOrder = async () => {
    if (!uploadedFile || !estimatedWeight || !activeMaterial) {
      setFileError('Upload a project file before placing your order.');
      return;
    }

    const quotePayload = buildQuotePayload(uploadedFile, activeMaterial, volumeCm3, quote);

    if (!session?.user) {
      await saveCustomOrderFile(PENDING_CUSTOM_FILE_KEY, uploadedFile);
      sessionStorage.setItem(PENDING_CUSTOM_QUOTE_KEY, JSON.stringify(quotePayload));
      router.push(loginPath(pathname || '/'));
      return;
    }

    if (!tokenReady) {
      showToast('Preparing your session. Try again in a moment.', 'error');
      return;
    }

    setIsAddingToCart(true);

    try {
      const fileName = await addCustomQuoteToCart(session.user.id, uploadedFile, quotePayload);
      await refreshCart();
      showToast(`${fileName} added to cart.`, 'success');
      router.push(checkoutHref);
    } catch (err) {
      showToast(err.message || 'Failed to add custom project to cart.', 'error');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const weightDisplay = isAnalyzing
    ? 'Calculating...'
    : estimatedWeight
      ? `${estimatedWeight} g`
      : '-- g';
  const timeDisplay = isAnalyzing ? '-- hrs' : printTime ?? '-- hrs';
  const isBusy = isAnalyzing || isAddingToCart || materialsLoading;

  const calculator = (
    <div className={`max-w-4xl mx-auto rounded-xl p-sm md:p-md ${t.card} ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-md">
        <div className="lg:col-span-3 flex flex-col gap-md">
          <div
            role="button"
            tabIndex={0}
            onClick={handleUploadClick}
            onKeyDown={(e) => e.key === 'Enter' && handleUploadClick()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`relative h-[340px] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden ${
              isAnalyzing ? 'upload-loading-active' : t.upload
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".stl,.obj"
              className="hidden"
              onChange={handleFileChange}
            />
            {isAnalyzing && (
              <>
                <div className="upload-scan-line" aria-hidden="true" />
                <div className={`absolute inset-0 flex flex-col items-center justify-center gap-xs backdrop-blur-[1px] ${t.uploadOverlay}`}>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand">
                    {'// MESH_SCAN'}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted animate-pulse">
                    Parsing volume
                  </span>
                </div>
              </>
            )}
            <span className={`material-symbols-outlined text-4xl mb-sm ${t.uploadIcon} ${isAnalyzing ? 'opacity-30' : ''}`}>
              cloud_upload
            </span>
            {uploadedFile ? (
              <>
                <span className={`font-mono text-sm text-center break-all px-4 uppercase bg-green-500 text-white rounded-sm p-1 ${t.uploadFileName} ${isAnalyzing ? 'opacity-40' : ''}`}>
                  {uploadedFile.name}
                </span>
                <span className={`font-mono text-xs mt-xs ${t.uploadHint} ${isAnalyzing ? 'opacity-0' : ''}`}>
                  Click or drop to replace file
                </span>
              </>
            ) : (
              <span className={`font-mono text-sm uppercase ${t.uploadText} ${isAnalyzing ? 'opacity-30' : ''}`}>
                Drop .STL or .OBJ here
              </span>
            )}
          </div>

          {fileError && (
            <p className="font-mono text-xs text-[#ba1a1a] uppercase -mt-sm">{fileError}</p>
          )}

          <div className="flex flex-col gap-sm">
            <span className={`font-mono text-xs uppercase tracking-widest ${t.label}`}>
              {'// MATERIAL_SELECT'}
            </span>
            <div className="grid grid-cols-3 gap-xs">
              {materials.map((mat) => {
                const isActive = activeMaterial?.id === mat.id;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setActiveMaterial(mat)}
                    disabled={materialsLoading}
                    className={`p-sm rounded-lg flex flex-col items-center transition-all ${
                      isActive ? t.matActive : t.matInactive
                    }`}
                  >
                    <span className={`font-display font-semibold text-2xl ${t.matName}`}>{mat.name}</span>
                    <span className={`font-mono text-[10px] mt-xs uppercase ${t.matTag}`}>{mat.tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`lg:col-span-2 rounded-lg p-md flex flex-col justify-between ${t.panel}`}>
          <div>
            <span className={`font-mono text-xs uppercase mb-md block tracking-widest ${t.panelLabel}`}>
              {'// ANALYSIS_REPORT'}
            </span>
            <div className={`flex justify-between border-b py-sm ${t.divider}`}>
              <span className={t.rowLabel}>Estimated Weight</span>
              <span className={`font-mono ${t.rowValue}`}>{weightDisplay}</span>
            </div>
            <div className={`flex justify-between border-b py-sm ${t.divider}`}>
              <span className={t.rowLabel}>Selected Material</span>
              <span className={`font-mono ${t.rowValue}`}>{activeMaterial?.name ?? '--'}</span>
            </div>
            <div className={`flex justify-between border-b py-sm ${t.divider}`}>
              <span className={t.rowLabel}>Print Duration</span>
              <span className={`font-mono ${t.rowValue}`}>{timeDisplay}</span>
            </div>
          </div>

          <div className="mt-md">
            <span className={`font-mono text-xs block mb-xs uppercase tracking-widest ${t.totalLabel}`}>
              Total Cost
            </span>
            <div className="flex items-baseline gap-xs">
              <span className={`font-display font-extrabold text-4xl ${t.totalCurrency}`}>৳</span>
              <span className={`font-display font-extrabold text-5xl ${t.totalAmount}`}>
                {isAnalyzing ? '...' : totalPrice}
              </span>
              {quote?.discountApplied && quote.regularTotal > totalPrice && (
                <span className={`font-mono text-sm line-through ${t.rowLabel}`}>
                  ৳{quote.regularTotal}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isBusy || !activeMaterial}
              className="w-full bg-brand text-white py-sm mt-md font-bold uppercase rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isAddingToCart ? 'Adding to Cart...' : checkoutLabel}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className={`font-mono text-[10px] mt-sm leading-tight ${t.panelLabel}`}>
              Estimate only. Final weight is confirmed after slicing; walls and
              supports may affect actual material usage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return calculator;
  }

  return (
    <Section variant={t.section} className="reveal-on-scroll py-xl relative overflow-hidden">
      {showHeader && (
        <SectionHeader
          align="center"
          light={t.headerLight}
          eyebrow={eyebrow}
          title={title}
          description={description}
          className="mb-lg"
        />
      )}
      {calculator}
      <div className={`absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l ${t.gradient} to-transparent pointer-events-none`} />
    </Section>
  );
}
