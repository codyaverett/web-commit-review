import { createApp } from "vue";
import { createPinia } from "pinia";
import PrimeVue from "primevue/config";
import ConfirmationService from "primevue/confirmationservice";
import Tooltip from "primevue/tooltip";
import App from "./App.vue";
import router from "./router";

import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
// Initial theme - will be replaced dynamically by useTheme composable
import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "./styles/animations.css";
import "./styles/theme.css";

createApp(App)
    .use(createPinia())
    .use(router)
    .use(PrimeVue, { ripple: true })
    .use(ConfirmationService)
    .directive("tooltip", Tooltip)
    .mount("#app");
