// ============ B1 ============
// LISTENING B1
import LS_1_B1 from "./B1/LISTENING/LS_1_B1";
import LS_2_B1 from "./B1/LISTENING/LS_2_B1";
import LS_3_B1 from "./B1/LISTENING/LS_3_B1";
import LS_4_B1 from "./B1/LISTENING/LS_4_B1";

// RUOE B1 (carpeta: RUOE, archivos: RUOE_X_B1)
import RUOE_1_B1 from "./B1/RUOE/RUOE_1_B1";
import RUOE_2_B1 from "./B1/RUOE/RUOE_2_B1";
import RUOE_3_B1 from "./B1/RUOE/RUOE_3_B1";
import RUOE_4_B1 from "./B1/RUOE/RUOE_4_B1";
import RUOE_5_B1 from "./B1/RUOE/RUOE_5_B1";
import RUOE_6_B1 from "./B1/RUOE/RUOE_6_B1";
import RUOE_7_B1 from "./B1/RUOE/RUOE_7_B1";

// ============ B2 ============
// LISTENING B2
import LS_1_B2 from "./B2/LISTENING/LS_1_B2";
import LS_2_B2 from "./B2/LISTENING/LS_2_B2";
import LS_3_B2 from "./B2/LISTENING/LS_3_B2";
import LS_4_B2 from "./B2/LISTENING/LS_4_B2";

// RUOE B2
import RUOE_1_B2 from "./B2/RUOE/RUOE_1_B2";
import RUOE_2_B2 from "./B2/RUOE/RUOE_2_B2";
import RUOE_3_B2 from "./B2/RUOE/RUOE_3_B2";
import RUOE_4_B2 from "./B2/RUOE/RUOE_4_B2";
import RUOE_5_B2 from "./B2/RUOE/RUOE_5_B2";
import RUOE_6_B2 from "./B2/RUOE/RUOE_6_B2";
import RUOE_7_B2 from "./B2/RUOE/RUOE_7_B2";

// ============ C1 ============
// LISTENING C1
import LS_1_C1 from "./C1/LISTENING/LS_1_C1";
import LS_2_C1 from "./C1/LISTENING/LS_2_C1";
import LS_3_C1 from "./C1/LISTENING/LS_3_C1";
import LS_4_C1 from "./C1/LISTENING/LS_4_C1";

// RUOE C1
import RUOE_1_C1 from "./C1/RUOE/RUOE_1_C1";
import RUOE_2_C1 from "./C1/RUOE/RUOE_2_C1";
import RUOE_3_C1 from "./C1/RUOE/RUOE_3_C1";
import RUOE_4_C1 from "./C1/RUOE/RUOE_4_C1";
import RUOE_5_C1 from "./C1/RUOE/RUOE_5_C1";
import RUOE_6_C1 from "./C1/RUOE/RUOE_6_C1";
import RUOE_7_C1 from "./C1/RUOE/RUOE_7_C1";

// ============ C2 ============
// LISTENING C2
import LS_1_C2 from "./C2/LISTENING/LS_1_C2";
import LS_2_C2 from "./C2/LISTENING/LS_2_C2";
import LS_3_C2 from "./C2/LISTENING/LS_3_C2";
import LS_4_C2 from "./C2/LISTENING/LS_4_C2";

// RUOE C2
import RUOE_1_C2 from "./C2/RUOE/RUOE_1_C2";
import RUOE_2_C2 from "./C2/RUOE/RUOE_2_C2";
import RUOE_3_C2 from "./C2/RUOE/RUOE_3_C2";
import RUOE_4_C2 from "./C2/RUOE/RUOE_4_C2";
import RUOE_5_C2 from "./C2/RUOE/RUOE_5_C2";
import RUOE_6_C2 from "./C2/RUOE/RUOE_6_C2";
import RUOE_7_C2 from "./C2/RUOE/RUOE_7_C2";

// ============ MAPA DE COMPONENTES ============
export const componentMap = {
  B1: {
    listening: {
      1: LS_1_B1,
      2: LS_2_B1,
      3: LS_3_B1,
      4: LS_4_B1,
    },
    reading: {
      1: RUOE_1_B1,
      5: RUOE_5_B1,
      6: RUOE_6_B1,
      7: RUOE_7_B1,
    },
    use_of_english: {
      2: RUOE_2_B1,
      3: RUOE_3_B1,
      4: RUOE_4_B1,
    },
  },
  B2: {
    listening: {
      1: LS_1_B2,
      2: LS_2_B2,
      3: LS_3_B2,
      4: LS_4_B2,
    },
    reading: {
      1: RUOE_1_B2,
      5: RUOE_5_B2,
      6: RUOE_6_B2,
      7: RUOE_7_B2,
    },
    use_of_english: {
      2: RUOE_2_B2,
      3: RUOE_3_B2,
      4: RUOE_4_B2,
    },
  },
  C1: {
    listening: {
      1: LS_1_C1,
      2: LS_2_C1,
      3: LS_3_C1,
      4: LS_4_C1,
    },
    reading: {
      1: RUOE_1_C1,
      5: RUOE_5_C1,
      6: RUOE_6_C1,
      7: RUOE_7_C1,
    },
    use_of_english: {
      2: RUOE_2_C1,
      3: RUOE_3_C1,
      4: RUOE_4_C1,
    },
  },
  C2: {
    listening: {
      1: LS_1_C2,
      2: LS_2_C2,
      3: LS_3_C2,
      4: LS_4_C2,
    },
    reading: {
      1: RUOE_1_C2,
      5: RUOE_5_C2,
      6: RUOE_6_C2,
      7: RUOE_7_C2,
    },
    use_of_english: {
      2: RUOE_2_C2,
      3: RUOE_3_C2,
      4: RUOE_4_C2,
    },
  },
};

export const getComponent = (level, section, part) => {
  try {
    const levelUpper = level?.toUpperCase();
    const partNum = parseInt(part);
    const component = componentMap[levelUpper]?.[section]?.[partNum];
    
    if (!component) {
      console.warn(`Component not found for ${levelUpper}/${section}/${partNum}`);
    }
    return component;
  } catch (error) {
    console.error(`Error getting component for ${level}/${section}/${part}`, error);
    return null;
  }
};