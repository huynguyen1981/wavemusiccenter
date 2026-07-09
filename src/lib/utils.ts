import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Chuyển đổi link Google Drive sang link ảnh trực tiếp
export function getDirectLink(url: string) {
  if (!url || typeof url !== 'string') return '';
  const trimmedUrl = url.trim();
  if (trimmedUrl === '' || trimmedUrl === 'website_logo') return '';
  
  if (trimmedUrl.includes('drive.google.com')) {
    const idMatch = trimmedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || 
                    trimmedUrl.match(/id=([a-zA-Z0-9_-]+)/);
                    
    if (idMatch && idMatch[1]) {
      // Using lh3.googleusercontent.com/d/ which is higher quality for hero images
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }
  }

  // Nếu là link ảnh ngoài (bắt đầu bằng http/https) và không phải Google Drive, YouTube hay localhost
  if (
    (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) &&
    !trimmedUrl.includes('drive.google.com') &&
    !trimmedUrl.includes('googleusercontent.com') &&
    !trimmedUrl.includes('youtube.com') &&
    !trimmedUrl.includes('img.youtube.com') &&
    !trimmedUrl.includes('youtu.be') &&
    !trimmedUrl.includes('localhost') &&
    !trimmedUrl.includes('127.0.0.1')
  ) {
    // Sử dụng wsrv.nl làm proxy ảnh miễn phí để bypass hotlink protection của website nguồn
    return `https://wsrv.nl/?url=${encodeURIComponent(trimmedUrl)}`;
  }

  return trimmedUrl;
}

export function formatPrice(amount: number, _lang?: 'en' | 'vi') {
  // Luôn dùng định dạng USD chuẩn Mỹ theo yêu cầu
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
