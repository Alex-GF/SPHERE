import { createContext } from "react";

export interface YamlLinkShareInteface {
    selectedYamlLink: string;
    setSelectedYamlLink: (selectedYamlLink: string) => void;
    yamlLinkModalOpen: boolean;
    setYamlLinkModalOpen: (yamlLinkModalOpen: boolean) => void;
}

export const YamlLinkShare = createContext<YamlLinkShareInteface>({
    selectedYamlLink: '',
    setSelectedYamlLink: () => {},
    yamlLinkModalOpen: false,
    setYamlLinkModalOpen: () => {},
});