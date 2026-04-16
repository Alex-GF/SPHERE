export function getClearEditorValue(){

    const currentDate = new Date().toISOString().split('T')[0];

    return `saasName: Your SaaS Name
syntaxVersion: "3.1"
version: "latest"
createdAt: ${currentDate}
billing:
  monthly: 1
currency: EUR
features:
  feature1:
    description: Feature 1 description
    valueType: BOOLEAN
    defaultValue: true
    type: DOMAIN
usageLimits: null
plans:
  BASIC:
    description: Basic plan
    price: 0.0
    unit: user/month
    features: null
    usageLimits: null
addOns: null`
}