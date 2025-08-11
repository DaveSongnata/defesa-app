import React, { useEffect } from 'react';
import { Text, TextInput, Platform } from 'react-native';

export const FontProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Sobrescrever o render do Text para adicionar Poppins como padrão
    const oldTextRender = (Text as any).render;
    (Text as any).render = function(...args: any[]) {
      const origin = oldTextRender.call(this, ...args);
      return React.cloneElement(origin, {
        style: [
          { fontFamily: 'Poppins-Regular' },
          ...(Array.isArray(origin.props.style) ? origin.props.style : [origin.props.style])
        ]
      });
    };

    // Também aplicar para TextInput
    const oldTextInputRender = (TextInput as any).render;
    (TextInput as any).render = function(...args: any[]) {
      const origin = oldTextInputRender.call(this, ...args);
      return React.cloneElement(origin, {
        style: [
          { fontFamily: 'Poppins-Regular' },
          ...(Array.isArray(origin.props.style) ? origin.props.style : [origin.props.style])
        ]
      });
    };

    // Cleanup
    return () => {
      (Text as any).render = oldTextRender;
      (TextInput as any).render = oldTextInputRender;
    };
  }, []);

  return <>{children}</>;
};