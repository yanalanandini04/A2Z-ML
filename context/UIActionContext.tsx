
import React, { createContext, useContext, ReactNode, useCallback } from 'react';

interface UIActionContextType {
    openApiKeyModal: () => void;
}

const UIActionContext = createContext<UIActionContextType | undefined>(undefined);

export const UIActionProvider: React.FC<{ children: ReactNode; onOpenApiKeyModal: () => void }> = ({ children, onOpenApiKeyModal }) => {
    const openApiKeyModal = useCallback(() => {
        onOpenApiKeyModal();
    }, [onOpenApiKeyModal]);

    return (
        <UIActionContext.Provider value={{ openApiKeyModal }}>
            {children}
        </UIActionContext.Provider>
    );
};

export const useUIAction = (): UIActionContextType => {
    const context = useContext(UIActionContext);
    if (!context) {
        throw new Error('useUIAction must be used within a UIActionProvider');
    }
    return context;
};
