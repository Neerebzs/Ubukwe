'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface TranslatedTextProps {
  text: string;
  fallback?: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  [key: string]: any;
}

export function TranslatedText({ text, fallback, as: Component = 'span', className, ...props }: TranslatedTextProps) {
  const { t, language } = useTranslation();
  const [translated, setTranslated] = useState(text); // Start with original text
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!text) {
      setTranslated('');
      return;
    }

    if (language === 'en') {
      setTranslated(text);
      return;
    }

    setIsLoading(true);
    t(text)
      .then(result => {
        setTranslated(result || fallback || text);
      })
      .catch(() => {
        setTranslated(fallback || text);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [text, language, fallback, t]);

  return <Component className={className} {...props}>{translated}</Component>;
}
