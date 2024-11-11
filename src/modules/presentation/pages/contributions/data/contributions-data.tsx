import { Chip } from "@mui/material";
import ai4Pricing from './descriptions/AI4Pricing.md';
import harvey from './descriptions/Harvey.md';
import goodPractisesPricing2Yaml from './descriptions/goog-practises-pricing2yaml.md';
import sphereServitization from './descriptions/sphere-servitization.md';

interface ContributionTag{
    name: string,
    color: string,
}

export interface Contribution{
    title: string,
    description: string,
    markdownDescription: string,
    supervisor: string,
    tags: JSX.Element[],
}

function getContributionTag(name: string){

    const contributionTag: ContributionTag | undefined = contributionTags.find(tag => tag.name === name);

    if (!contributionTag) {
        return <></>;
    }else{
        return <Chip label={contributionTag.name} style={{backgroundColor: contributionTag.color, color: "white"}}/>;
    }
}

const contributionTags: ContributionTag[] = [
    {
        name: "IT Management",
        color: "#B8860B",
    },
    {
        name: "Cloud",
        color: "#1F77B4",
    },
    {
        name: "Machine Learning",
        color: "#4B0082",
    },
    {
        name: "LLM",
        color: "#2CA02C",
    },
]

export const contributions: Contribution[] = [
    {
        title: "Optimización y ampliación de AI4Pricing",
        description: "Este trabajo se centra en mejorar la eficacia de la extracción de precios de sitios web de SaaS, mediante la optimización de prompts y la implementación de Agentes LLM para extraer contenido dinámico. Además, se plantea explorar el uso de grafos de conocimiento que identifiquen elementos clave, reduciendo el ruido en los datos procesados por el LLM. El objetivo es lograr una extracción completa y precisa de la información necesaria para modelar los iPricings de los 30 SaaS del dataset de ICSOC, sirviendo como base para avanzar en la transformación hacia modelos inteligentes.",
        markdownDescription: ai4Pricing,
        supervisor: "José Antonio Parejo Maestre and Antonio Ruiz Cortés",
        tags: [
            getContributionTag("Machine Learning"),
            getContributionTag("LLM"),
        ],
    },
    {
        title: "HARVEY: Holistic Analysis and Regulation Virtual Expert for You",
        description: "Este trabajo se centra en implementar un chatbot que se integre en la pricing card de SPHERE y que permita hacer diversas consultas sobre un pricing determinado. Además, se plantea explorar el uso de function calling para poder invocar funciones del minizinc que permita obtener datos de otros. El objetivo es lograr un chatbot que pueda interactuar con un pricing y sus versiones anteriores entendiendo al usuario y dando información a través de llamadas a funciones programáticas. Además, podría extenderse para interpretar los requisitos del usuario y poder elaborar restricciones personalizadas que al ejecutar el minizinc nos den valores ciertos y personalizados para el usuario acerca de dicho pricing.",
        markdownDescription: harvey,
        supervisor: "José Antonio Parejo Maestre and Antonio Ruiz Cortés",
        tags: [
            getContributionTag("LLM"),
        ],
    },
    // {
    //     title: "Servitización de SPHERE",
    //     description: "Este trabajo puramente técnico consiste en transformar SPHERE en un SaaS que ofrece todas las herramientas de la suite Pricing4SaaS de forma centralizada. Entre las tareas, se propone pricificar SPHERE, diseñar vistas principales del sistema (landing page, login/registro, home page, etc) y prepararlo para despliegue en IaaS/PaaS.",
    //     markdownDescription: sphereServitization,
    //     supervisor: "José Antonio Parejo Maestre and Antonio Ruiz Cortés",
    //     tags: [
    //         getContributionTag("Cloud"),
    //     ],
    // },
    {
        title: "Buenas prácticas para el uso de Pricing2Yaml",
        description: "Este trabajo de carácter metodológico establece directrices y buenas prácticas para modelar utilizando Pricing2Yaml. Estas guías serán esenciales para abordar el 'process engine', la fase posterior a la extracción de precios. Se propone aplicar estas prácticas sobre el dataset de 162 precios (ICSOC24) e identificar posibles mejoras en la sintaxis. De ser viables, dichas mejoras se implementarían durante el desarrollo del proyecto.",
        markdownDescription: goodPractisesPricing2Yaml,
        supervisor: "José Antonio Parejo Maestre and Antonio Ruiz Cortés",
        tags: [
            getContributionTag("IT Management"),
        ],
    },
]