import React from 'react';
import { Helmet } from 'react-helmet';

const SEO = ({ 
  title = 'NUGL - The Digital Greenhouse', 
  description = 'Where Cannabis Culture Meets Crypto Innovation and AI Intelligence. Real-time market intelligence, strain discovery, NFT trading, and AI-powered insights.',
  keywords = 'cannabis, crypto, cryptocurrency, NFT, AI, marijuana, bitcoin, ethereum, strain finder, dispensary, cannabis news',
  image = 'https://nugl.com/og-image.jpg',
  url = 'https://nugl.com',
  type = 'website'
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="author" content="NUGL" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="NUGL" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#14b8a6" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;