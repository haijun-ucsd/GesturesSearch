/* Explanation:
 *
 *  type 1: each picture should strictly have =1 label under this category.
 *  type 2: accepts a list of labels, any number from 0 to all possible.
 *  type 3: human figure.
 */

export const labels_data = [
  {
    category: "location",
    category_displaytext: "Location",
    color: "#A0D568",
    icon: "CategoryIcon_Location",
    subcategories: [
      {
        subcategory: "in_outdoor",
        subcategory_displaytext: "In/outdoor",
        description: "In/outdoor",
        type: 1,
        required: true,
        labels: [
          { label: "indoor", label_id: 0, pictures: ["id_1", "id_2", "id_3"] },
          { label: "outdoor", label_id: 1, pictures: [] },
        ],
      },
      {
        subcategory: "purpose",
        subcategory_displaytext: "Purpose of the place",
        description:
          "A commonly used name of the place indicating the function that it is designed for. e.g. subway, gym, swimming pool, beach, hospital, parking lot",
        type: 2,
        required: true,
        labels: [
          { label: "library", label_id: 0, pictures: [] },
          { label: "hospital", label_id: 1, pictures: [] },
          { label: "shopping", label_id: 2, pictures: [] },
          { label: "public transportation", label_id: 3, pictures: [] },
          { label: "entertainment", label_id: 4, pictures: [] },
          { label: "sport", label_id: 5, pictures: [] },
          { label: "nature", label_id: 6, pictures: [] },
          { label: "parking lot", label_id: 7, pictures: [] },
          { label: "street", label_id: 8, pictures: [] },
          { label: "pedestrian", label_id: 9, pictures: [] },
          { label: "restaurant", label_id: 10, pictures: [] },
          { label: "work space", label_id: 11, pictures: [] },
        ],
      },
      {
        subcategory: "architecture_component",
        subcategory_displaytext: "Architecture component",
        description:
          "Architecural components that are in proximity to the subject or likely to influence their behaviors. \n e.g. at the entrance, in the corridor, in the waiting room, inside the pool",
        type: 2,
        required: false,
        labels: [
          { label: "entrance", label_id: 0, pictures: [] },
          { label: "corridor", label_id: 1, pictures: [] },
          { label: "bench", label_id: 2, pictures: [] },
          { label: "cabin", label_id: 3, pictures: [] },
          { label: "waiting room", label_id: 4, pictures: [] },
          { label: "shelf", label_id: 5, pictures: [] },
          { label: "pool", label_id: 6, pictures: [] },
          { label: "poolside", label_id: 7, pictures: [] },
          { label: "table", label_id: 8, pictures: [] },
          { label: "zebra walk", label_id: 9, pictures: [] },
          { label: "rock climbing wall", label_id: 10, pictures: [] },
        ],
      },
    ],
  },
  {
    category: "spectators",
    category_displaytext: "Spectators",
    color: "#FFCE54",
    icon: "CategoryIcon_Spectators",
    subcategories: [
      {
        subcategory: "quantity",
        subcategory_displaytext: "Quantity",
        description:
          "number of people appearing in the photo minus the observed subject",
        type: 1,
        required: true,
        labels: [
          { label: "none", label_id: 0, pictures: ["id_1", "id_2", "id_3"] },
          { label: "small", label_id: 1, pictures: [] },
          { label: "large", label_id: 2, pictures: [] },
        ],
      },
      {
        subcategory: "density",
        subcategory_displaytext: "Density",
        description:
          "'dense' if >=3 people within a 2-meter diameter centering the subject; otherwise, 'sparse' if any spectator appeared in the photo and 'none' if no spectator at all. \n If the photo didn't give enough context, select based on your common sense.",
        type: 1,
        required: true,
        labels: [
          { label: "none", label_id: 0, pictures: [] },
          { label: "sparse", label_id: 1, pictures: [] },
          { label: "dense", label_id: 2, pictures: [] },
        ],
      },
      {
        subcategory: "attentive",
        subcategory_displaytext: "Attentive",
        description:
          "Attentive spectator are spectators that are attentively paying attention to the subject. \n e.g. friends or audience that are looking at the subject. [input a number, or “many” if N > 8]",
        type: 1,
        required: true,
        labels: [
          { label: "0", label_id: 0, pictures: [] },
          { label: "1", label_id: 1, pictures: [] },
          { label: "2", label_id: 2, pictures: [] },
          { label: "3", label_id: 3, pictures: [] },
          { label: "4", label_id: 4, pictures: [] },
          { label: "5", label_id: 5, pictures: [] },
          { label: "6", label_id: 6, pictures: [] },
          { label: "7", label_id: 7, pictures: [] },
          { label: "8", label_id: 8, pictures: [] },
          { label: "many", label_id: 9, pictures: [] },
        ],
      },
    ],
  },
  {
    category: "modality",
    category_displaytext: "Modality",
    description:
      "'Modality': In the context of human–computer interaction, a modality is the classification of a single independent channel of sensory input/output between a computer and a human. \n Select unavailable modalities (red for unavailable and green for available",
    color: "#4FC1E8",
    icon: "CategoryIcon_Modality",
    subcategories: [
      {
        subcategory: "head",
        subcategory_displaytext: "Head",
        type: 3,
        //required: true,
        labels: [
          {
            label: "available",
            label_id: 0,
            pictures: ["id_1", "id_2", "id_3"],
          },
          { label: "unavailable", label_id: 1, pictures: [] },
        ],
      },
      {
        subcategory: "eyes",
        subcategory_displaytext: "Eyes",
        type: 3,
        //required: true,
        labels: [
          { label: "available", label_id: 0, pictures: [] },
          { label: "unavailable", label_id: 1, pictures: [] },
        ],
      },
      {
        subcategory: "voice",
        subcategory_displaytext: "Voice",
        type: 3,
        //required: true,
        labels: [
          { label: "available", label_id: 0, pictures: [] },
          { label: "unavailable", label_id: 1, pictures: [] },
        ],
      },
      {
        subcategory: "facial_expression",
        subcategory_displaytext: "Facial expression",
        type: 3,
        //required: true,
        labels: [
          { label: "available", label_id: 0, pictures: [] },
          { label: "unavailable", label_id: 1, pictures: [] },
        ],
      },
      {
        subcategory: "r_arm",
        subcategory_displaytext: "Right arm",
        type: 3,
        //required: true,
        labels: [
          { label: "available", label_id: 0, pictures: [] },
          { label: "unavailable", label_id: 1, pictures: [] },
        ],
      },
      {
        subcategory: "l_arm",
        subcategory_displaytext: "Left arm",
        type: 3,
        //required: true,
        labels: [
          { label: "available", label_id: 0, pictures: [] },
          { label: "unavailable", label_id: 1, pictures: [] },
        ],
      },
      {
        subcategory: "r_hand",
        subcategory_displaytext: "Right hand",
        type: 3,
        //required: true,
        labels: [
          { label: "available", label_id: 0, pictures: [] },
          { label: "unavailable", label_id: 1, pictures: [] },
        ],
      },
      {
        subcategory: "l_hand",
        subcategory_displaytext: "Left hand",
        type: 3,
        //required: true,
        labels: [
          { label: "available", label_id: 0, pictures: [] },
          { label: "unavailable", label_id: 1, pictures: [] },
        ],
      },
      {
        subcategory: "legs",
        subcategory_displaytext: "Legs",
        type: 3,
        //required: true,
        labels: [
          { label: "available", label_id: 0, pictures: [] },
          { label: "unavailable", label_id: 1, pictures: [] },
        ],
      },
      {
        subcategory: "feet",
        subcategory_displaytext: "Feet",
        type: 3,
        //required: true,
        labels: [
          { label: "available", label_id: 0, pictures: [] },
          { label: "unavailable", label_id: 1, pictures: [] },
        ],
      },
    ],
  },
  {
    category: "demographic",
    category_displaytext: "Demographic",
    color: "#ED5564",
    icon: "CategoryIcon_Demographic",
    subcategories: [
      {
        subcategory: "age",
        subcategory_displaytext: "Age",
        description: "Label subject's age with approximate age group",
        type: 1,
        required: false, //required: true,
        labels: [
          { label: "baby", label_id: 0, pictures: ["id_1", "id_2", "id_3"] },
          { label: "child", label_id: 1, pictures: [] },
          { label: "teen", label_id: 2, pictures: [] },
          { label: "young adult", label_id: 3, pictures: [] },
          { label: "adult", label_id: 4, pictures: [] },
          { label: "senior", label_id: 5, pictures: [] },
        ],
      },
      {
        subcategory: "sex",
        subcategory_displaytext: "Biological sex",
        type: 1,
        required: false, //required: true,
        labels: [
          { label: "female", label_id: 0, pictures: [] },
          { label: "male", label_id: 1, pictures: [] },
        ],
      },
      {
        subcategory: "social_role",
        subcategory_displaytext: "Social role",
        description:
          "The role that the subject plays in the current context, including all kinds of occupations and other roles such as: customer, passenger, patient, parents.",
        type: 2,
        required: false,
        labels: [
          { label: "staff", label_id: 0, pictures: [] },
          { label: "coach", label_id: 1, pictures: [] },
          { label: "parent", label_id: 2, pictures: [] },
          { label: "student", label_id: 3, pictures: [] },
          { label: "customer", label_id: 4, pictures: [] },
          { label: "caregiver", label_id: 5, pictures: [] },
          { label: "transit security", label_id: 6, pictures: [] },
          { label: "cleaning crew", label_id: 7, pictures: [] },
        ],
      },
    ],
  },
  {
    category: "posture",
    category_displaytext: "Posture",
    description:
      "[choose from list]\nDescription of the subject's physical posture irrelevant to the objects they are interacting with and the environment they are situated in.",
    color: "#AC92EB",
    icon: "CategoryIcon_Posture",
    subcategories: [
      {
        subcategory: "posture",
        subcategory_displaytext: "",
        type: 2,
        required: true,
        labels: [
          { label: "sitting", label_id: 0, pictures: ["id_1", "id_2", "id_3"] },
          { label: "standing", label_id: 1, pictures: [] },
          { label: "walking", label_id: 2, pictures: [] },
          { label: "running", label_id: 3, pictures: [] },
          { label: "jumping", label_id: 4, pictures: [] },
          { label: "bending", label_id: 5, pictures: [] },
          { label: "squatting", label_id: 6, pictures: [] },
          { label: "kneeling", label_id: 7, pictures: [] },
          { label: "climbing", label_id: 8, pictures: [] },
          { label: "hanging", label_id: 9, pictures: [] },
          { label: "lying", label_id: 10, pictures: [] },
          { label: "backbending", label_id: 11, pictures: [] },
          { label: "holding sth", label_id: 12, pictures: [] },
          { label: "grasping sth", label_id: 13, pictures: [] },
          { label: "operating sth", label_id: 14, pictures: [] },
          { label: "pulling sth", label_id: 15, pictures: [] },
          { label: "pushing sth", label_id: 16, pictures: [] },
          { label: "reaching for sth", label_id: 17, pictures: [] },
          { label: "pointing at sth", label_id: 18, pictures: [] },
          { label: "crossing arms", label_id: 19, pictures: [] },
          { label: "raising arm(s)", label_id: 20, pictures: [] },
          { label: "crossing legs", label_id: 21, pictures: [] },
          { label: "raising leg(s)", label_id: 22, pictures: [] },
        ],
      },
    ],
  },
];
