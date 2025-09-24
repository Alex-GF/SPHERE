export function getClearEditorValue(){

    const currentDate = new Date().toISOString().split('T')[0];

    return `saasName: Your SaaS Name
syntaxVersion: "3.0"
version: "latest"
createdAt: ${currentDate}
currency: EUR
hasAnnualPayment: false
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