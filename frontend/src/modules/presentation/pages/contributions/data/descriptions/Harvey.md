Este trabajo se centra en implementar un chatbot que se integre en la pricing card de SPHERE y que permita hacer diversas consultas sobre un pricing determinado. Además, se plantea explorar el uso de function calling para poder invocar funciones del minizinc que permita obtener datos de otros. El objetivo es lograr un chatbot que pueda interactuar con un pricing y sus versiones anteriores entendiendo al usuario y dando información a través de llamadas a funciones programáticas. Además, podría extenderse para interpretar los requisitos del usuario y poder elaborar restricciones personalizadas que al ejecutar el minizinc nos den valores ciertos y personalizados para el usuario acerca de dicho pricing.

## Desglose de acciones:

-	Implementar chatbot usando LLMs que permita interacciones pricing-usuario. 
-	Utilizar las funciones existentes en CSP/minizinc para obtener información para determinadas consultas de los usuarios.
-	Explorar el desarrollo de restricciones a partir de lenguaje natural para aplicarlas al modelo de minizinc.

## Finalidad:

El objetivo es conseguir que el LLM sea útil para los usuarios (sobre todo los menos técnicos) y pueda ofrecer recomendaciones y estadísticas personalizadas utilizando el lenguaje natural.
