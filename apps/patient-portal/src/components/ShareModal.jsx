import React, { useState, useEffect, useRef } from 'react';
import { X, Link2, Mail, MessageCircle, Facebook, Code2, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

/**
 * ShareModal — An Airbnb-style share dialog.
 *
 * Props
 * ───────────────────────────────────────────
 * @param {boolean}  isOpen       – controls visibility
 * @param {Function} onClose      – called when the modal should close
 * @param {string}   title        – heading shown in the modal (e.g. "Share this clinic")
 * @param {string}   subtitle     – secondary line (e.g. clinic name + rating)
 * @param {string}   imageUrl     – thumbnail shown beside the subtitle
 * @param {string}   shareUrl     – the URL to share (defaults to window.location.href)
 * @param {string}   shareText    – text payload for native / social share
 */
export default function ShareModal({
  isOpen,
  onClose,
  title = 'Share this place',
  subtitle = '',
  imageUrl = '',
  shareUrl,
  shareText = '',
}) {
  const { toast } = useToast();
  const overlayRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const url = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText || title);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Slight delay for entrance animation
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      document.body.style.overflow = '';
      setIsAnimating(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  /* ─── Copy link handler ─── */
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: 'Link copied', description: 'The link has been copied to your clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast({ title: 'Link copied', description: 'The link has been copied to your clipboard.' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  /* ─── Native share (mobile) ─── */
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareText || title, url });
      } catch {
        /* user cancelled */
      }
    }
  };

  /* ─── Embed code ─── */
  const handleEmbed = () => {
    const embedCode = `<iframe src="${url}" width="600" height="450" style="border:0; border-radius:12px;" allowfullscreen loading="lazy"></iframe>`;
    navigator.clipboard.writeText(embedCode).then(() => {
      toast({ title: 'Embed code copied', description: 'Paste the code into your website.' });
    });
  };

  /* ─── Share option definitions ─── */
  const shareOptions = [
    {
      id: 'copy',
      label: copied ? 'Copied!' : 'Copy Link',
      icon: (
        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors group-hover:border-gray-900">
          {copied ? (
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          ) : (
            <Link2 className="w-5 h-5 text-gray-700" />
          )}
        </div>
      ),
      onClick: handleCopyLink,
    },
    {
      id: 'email',
      label: 'Email',
      icon: (
        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors group-hover:border-gray-900">
          <Mail className="w-5 h-5 text-gray-700" />
        </div>
      ),
      onClick: () => window.open(`mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encodedUrl}`, '_self'),
    },
    {
      id: 'messages',
      label: 'Messages',
      icon: (
        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors group-hover:border-gray-900">
          <MessageCircle className="w-5 h-5 text-gray-700" />
        </div>
      ),
      onClick: () => window.open(`sms:?&body=${encodedText}%20${encodedUrl}`, '_self'),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: (
        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors group-hover:border-gray-900">
          <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
      ),
      onClick: () => window.open(`https://wa.me/?text=${encodedText}%20${encodedUrl}`, '_blank'),
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: (
        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors group-hover:border-gray-900">
          <Facebook className="w-5 h-5 text-gray-700" />
        </div>
      ),
      onClick: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank', 'width=600,height=400'),
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: (
        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors group-hover:border-gray-900">
          <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
      ),
      onClick: () => window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank', 'width=600,height=400'),
    },
    {
      id: 'embed',
      label: 'Embed',
      icon: (
        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors group-hover:border-gray-900">
          <Code2 className="w-5 h-5 text-gray-700" />
        </div>
      ),
      onClick: handleEmbed,
    },
    ...(navigator.share
      ? [
          {
            id: 'more',
            label: 'More options',
            icon: (
              <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center transition-colors group-hover:border-gray-900">
                <MoreHorizontal className="w-5 h-5 text-gray-700" />
              </div>
            ),
            onClick: handleNativeShare,
          },
        ]
      : []),
  ];

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-colors duration-300 ${
        isAnimating ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent'
      }`}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={`bg-white w-full sm:w-[480px] sm:max-w-[95vw] max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl transition-all duration-300 ease-out ${
          isAnimating
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-8 opacity-0 sm:scale-95'
        }`}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between p-5 pb-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close share dialog"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>

          {/* ── Preview card ── */}
          {(subtitle || imageUrl) && (
            <div className="flex items-center gap-3 mb-5">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
              )}
              {subtitle && (
                <p className="text-sm text-gray-600 leading-snug line-clamp-2">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* ── Share grid ── */}
        <div className="px-5 pb-6 grid grid-cols-2 gap-3">
          {shareOptions.map((option) => (
            <button
              key={option.id}
              id={`share-option-${option.id}`}
              onClick={option.onClick}
              className="group flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all duration-200 text-left active:scale-[0.98]"
            >
              {option.icon}
              <span className="text-sm font-medium text-gray-900">{option.label}</span>
            </button>
          ))}
        </div>

        {/* Bottom safe-area spacer for mobile */}
        <div className="h-safe-area-inset-bottom sm:hidden" />
      </div>
    </div>
  );
}
