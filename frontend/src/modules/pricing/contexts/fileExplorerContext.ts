import { createContext } from "react";

export interface FileExplorerContextInteface {
    pricingOwner: string;
    selectedYamlLink: string;
    setSelectedYamlLink: (selectedYamlLink: string) => void;
    yamlLinkModalOpen: boolean;
    setYamlLinkModalOpen: (yamlLinkModalOpen: boolean) => void;
}

export const FileExplorerContext = createContext<FileExplorerContextInteface>({
    pricingOwner: '',
    selectedYamlLink: '',
    setSelectedYamlLink: () => {},
    yamlLinkModalOpen: false,
    setYamlLinkModalOpen: () => {},
});