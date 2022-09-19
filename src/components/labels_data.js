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
					{ label: "indoor", label_id: 0, label_displaytext: "indoor" },
					{ label: "outdoor", label_id: 1, label_displaytext: "outdoor" },
				],
			},
			{
				subcategory: "site",
				subcategory_displaytext: "Site",
				description:
					"A commonly used name of the place indicating the function that it is designed for. e.g. subway, gym, swimming pool, beach, hospital, parking lot",
				type: 2,
				required: true,
				labels: [
					{ label: "library", label_id: 0, label_displaytext: "library" },
					{ label: "hospital", label_id: 1, label_displaytext: "hospital" },
					{ label: "shopping", label_id: 2, label_displaytext: "shopping" },
					{ label: "public_transportation", label_id: 3, label_displaytext: "public transportation" },
					{ label: "entertainment", label_id: 4, label_displaytext: "entertainment" },
					{ label: "sport", label_id: 5, label_displaytext: "sport" },
					{ label: "nature", label_id: 6, label_displaytext: "nature" },
					{ label: "parking_lot", label_id: 7, label_displaytext: "parking lot" },
					{ label: "street", label_id: 8, label_displaytext: "street" },
					{ label: "pedestrian", label_id: 9, label_displaytext: "pedestrian" },
					{ label: "restaurant", label_id: 10, label_displaytext: "restaurant" },
					{ label: "work_space", label_id: 11, label_displaytext: "work space" },
				],
			},
			{
				subcategory: "archi_compo",
				subcategory_displaytext: "Architecture component",
				description:
					"Architecural components that are in proximity to the subject or likely to influence their behaviors. \n e.g. at the entrance, in the corridor, in the waiting room, inside the pool",
				type: 2,
				required: false,
				labels: [
					{ label: "entrance", label_id: 0, label_displaytext: "entrance" },
					{ label: "corridor", label_id: 1, label_displaytext: "corridor" },
					{ label: "bench", label_id: 2, label_displaytext: "bench" },
					{ label: "cabin", label_id: 3, label_displaytext: "cabin" },
					{ label: "waiting_room", label_id: 4, label_displaytext: "waiting room" },
					{ label: "shelf", label_id: 5, label_displaytext: "shelf" },
					{ label: "pool", label_id: 6, label_displaytext: "pool" },
					{ label: "poolside", label_id: 7, label_displaytext: "poolside" },
					{ label: "table", label_id: 8, label_displaytext: "table" },
					{ label: "zebra_walk", label_id: 9, label_displaytext: "zebra walk" },
					{ label: "rock_climbing_wall", label_id: 10, label_displaytext: "rock climbing wall" },
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
					{ label: "none", label_id: 0, label_displaytext: "none" },
					{ label: "small", label_id: 1, label_displaytext: "small" },
					{ label: "large", label_id: 2, label_displaytext: "large" },
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
					{ label: "none", label_id: 0, label_displaytext: "none" },
					{ label: "sparse", label_id: 1, label_displaytext: "sparse" },
					{ label: "dense", label_id: 2, label_displaytext: "dense" },
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
					{ label: "0", label_id: 0, label_displaytext: "0" },
					{ label: "1", label_id: 1, label_displaytext: "1" },
					{ label: "2", label_id: 2, label_displaytext: "2" },
					{ label: "3", label_id: 3, label_displaytext: "3" },
					{ label: "4", label_id: 4, label_displaytext: "4" },
					{ label: "5", label_id: 5, label_displaytext: "5" },
					{ label: "6", label_id: 6, label_displaytext: "6" },
					{ label: "7", label_id: 7, label_displaytext: "7" },
					{ label: "8", label_id: 8, label_displaytext: "8" },
					{ label: "many", label_id: 9, label_displaytext: "many" },
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
				subcategory_displaytext: "head",
				type: 3,
				//required: true,
				labels: [
					{ label: "unavailable", label_id: 0 },
					{ label: "available", label_id: 1 },
				],
			},
			{
				subcategory: "eyes",
				subcategory_displaytext: "eyes",
				type: 3,
				//required: true,
				labels: [
					{ label: "unavailable", label_id: 0 },
					{ label: "available", label_id: 1 },
				],
			},
			{
				subcategory: "voice",
				subcategory_displaytext: "voice",
				type: 3,
				//required: true,
				labels: [
					{ label: "unavailable", label_id: 0 },
					{ label: "available", label_id: 1 },
				],
			},
			{
				subcategory: "facial_expression",
				subcategory_displaytext: "facial expression",
				type: 3,
				//required: true,
				labels: [
					{ label: "unavailable", label_id: 0 },
					{ label: "available", label_id: 1 },
				],
			},
			{
				subcategory: "r_arm",
				subcategory_displaytext: "right arm",
				type: 3,
				//required: true,
				labels: [
					{ label: "unavailable", label_id: 0 },
					{ label: "available", label_id: 1 },
				],
			},
			{
				subcategory: "l_arm",
				subcategory_displaytext: "left arm",
				type: 3,
				//required: true,
				labels: [
					{ label: "unavailable", label_id: 0 },
					{ label: "available", label_id: 1 },
				],
			},
			{
				subcategory: "r_hand",
				subcategory_displaytext: "right hand",
				type: 3,
				//required: true,
				labels: [
					{ label: "unavailable", label_id: 0 },
					{ label: "available", label_id: 1 },
				],
			},
			{
				subcategory: "l_hand",
				subcategory_displaytext: "left hand",
				type: 3,
				//required: true,
				labels: [
					{ label: "unavailable", label_id: 0 },
					{ label: "available", label_id: 1 },
				],
			},
			{
				subcategory: "legs",
				subcategory_displaytext: "legs",
				type: 3,
				//required: true,
				labels: [
					{ label: "unavailable", label_id: 0 },
					{ label: "available", label_id: 1 },
				],
			},
			{
				subcategory: "feet",
				subcategory_displaytext: "feet",
				type: 3,
				//required: true,
				labels: [
					{ label: "unavailable", label_id: 0 },
					{ label: "available", label_id: 1 },
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
					{ label: "baby", label_id: 0, label_displaytext: "baby" },
					{ label: "child", label_id: 1, label_displaytext: "child" },
					{ label: "teen", label_id: 2, label_displaytext: "teen" },
					{ label: "young_adult", label_id: 3, label_displaytext: "young adult" },
					{ label: "adult", label_id: 4, label_displaytext: "adult" },
					{ label: "senior", label_id: 5, label_displaytext: "senior" },
				],
			},
			 {
				subcategory: "sex",
				subcategory_displaytext: "Biological sex",
				type: 1,
				required: false, //required: true,
				labels: [
					{ label: "female", label_id: 0, label_displaytext: "female" },
					{ label: "male", label_id: 1, label_displaytext: "male" },
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
					{ label: "staff", label_id: 0, label_displaytext: "staff" },
					{ label: "coach", label_id: 1, label_displaytext: "coach" },
					{ label: "parent", label_id: 2, label_displaytext: "parent" },
					{ label: "student", label_id: 3, label_displaytext: "student" },
					{ label: "customer", label_id: 4, label_displaytext: "customer" },
					{ label: "caregiver", label_id: 5, label_displaytext: "caregiver" },
					{ label: "transit_security", label_id: 6, label_displaytext: "transit securit" },
					{ label: "cleaning_crew", label_id: 7, label_displaytext: "cleaning crew" },
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
					{ label: "sitting", label_id: 0, label_displaytext: "sitting" },
					{ label: "standing", label_id: 1, label_displaytext: "standing" },
					{ label: "walking", label_id: 2, label_displaytext: "walking" },
					{ label: "running", label_id: 3, label_displaytext: "running" },
					{ label: "jumping", label_id: 4, label_displaytext: "jumping" },
					{ label: "bending", label_id: 5, label_displaytext: "bending" },
					{ label: "squatting", label_id: 6, label_displaytext: "squatting" },
					{ label: "kneeling", label_id: 7, label_displaytext: "kneeling" },
					{ label: "climbing", label_id: 8, label_displaytext: "climbing" },
					{ label: "hanging", label_id: 9, label_displaytext: "hanging" },
					{ label: "lying", label_id: 10, label_displaytext: "lying" },
					{ label: "backbending", label_id: 11, label_displaytext: "backbending" },
					{ label: "holding_sth", label_id: 12, label_displaytext: "holding sth." },
					{ label: "grasping_sth", label_id: 13, label_displaytext: "grasping sth." },
					{ label: "operating_sth", label_id: 14, label_displaytext: "operating sth." },
					{ label: "pulling_sth", label_id: 15, label_displaytext: "pulling sth." },
					{ label: "pushing_sth", label_id: 16, label_displaytext: "pushing sth." },
					{ label: "reaching_for_sth", label_id: 17, label_displaytext: "reaching for sth." },
					{ label: "pointing_at_sth", label_id: 18, label_displaytext: "pointing at sth." },
					{ label: "crossing_arms", label_id: 19, label_displaytext: "crossing arms" },
					{ label: "raising_arms", label_id: 20, label_displaytext: "raising arm(s)" },
					{ label: "crossing_legs", label_id: 21, label_displaytext: "crossing legs" },
					{ label: "raising_legs", label_id: 22, label_displaytext: "raising leg(s)" },
				],
			},
		],
	},
];

export const allModality = [
	{
		"text": "available head available",
		"label": "available",
		"bodypart": "head"
	},
	{
		"text": "free head free",
		"label": "available",
		"bodypart": "head"
	},
	{
		"text": "unavailable head unavailable",
		"label": "unavailable",
		"bodypart": "head"
	},
	{
		"text": "occupied head occupied",
		"label": "unavailable",
		"bodypart": "head"
	},
	{
		"text": "available eyes available",
		"label": "available",
		"bodypart": "eyes"
	},
	{
		"text": "free eyes free",
		"label": "available",
		"bodypart": "eyes"
	},
	{
		"text": "unavailable eyes unavailable",
		"label": "unavailable",
		"bodypart": "eyes"
	},
	{
		"text": "occupied eyes occupied",
		"label": "unavailable",
		"bodypart": "eyes"
	},
	{
		"text": "available voice available",
		"label": "available",
		"bodypart": "voice"
	},
	{
		"text": "free voice free",
		"label": "available",
		"bodypart": "voice"
	},
	{
		"text": "unavailable voice unavailable",
		"label": "unavailable",
		"bodypart": "voice"
	},
	{
		"text": "occupied voice occupied",
		"label": "unavailable",
		"bodypart": "voice"
	},
	{
		"text": "available facial expression available",
		"label": "available",
		"bodypart": "facial_expression"
	},
	{
		"text": "free facial expression free",
		"label": "available",
		"bodypart": "facial_expression"
	},
	{
		"text": "unavailable facial expression unavailable",
		"label": "unavailable",
		"bodypart": "facial_expression"
	},
	{
		"text": "occupied facial expression occupied",
		"label": "unavailable",
		"bodypart": "facial_expression"
	},
	{
		"text": "available face available",
		"label": "available",
		"bodypart": "facial_expression"
	},
	{
		"text": "free face free",
		"label": "available",
		"bodypart": "facial_expression"
	},
	{
		"text": "unavailable face unavailable",
		"label": "unavailable",
		"bodypart": "facial_expression"
	},
	{
		"text": "occupied face occupied",
		"label": "unavailable",
		"bodypart": "facial_expression"
	},
	{
		"text": "available right arm available",
		"label": "available",
		"bodypart": "r_arm"
	},
	{
		"text": "free right arm free",
		"label": "available",
		"bodypart": "r_arm"
	},
	{
		"text": "unavailable right arm unavailable",
		"label": "unavailable",
		"bodypart": "r_arm"
	},
	{
		"text": "occupied right arm occupied",
		"label": "unavailable",
		"bodypart": "r_arm"
	},
	{
		"text": "available left arm available",
		"label": "available",
		"bodypart": "l_arm"
	},
	{
		"text": "free left arm free",
		"label": "available",
		"bodypart": "l_arm"
	},
	{
		"text": "unavailable left arm unavailable",
		"label": "unavailable",
		"bodypart": "l_arm"
	},
	{
		"text": "occupied left arm occupied",
		"label": "unavailable",
		"bodypart": "l_arm"
	},
	{
		"text": "available right hand available",
		"label": "available",
		"bodypart": "r_hand"
	},
	{
		"text": "free right hand free",
		"label": "available",
		"bodypart": "r_hand"
	},
	{
		"text": "unavailable right hand unavailable",
		"label": "unavailable",
		"bodypart": "r_hand"
	},
	{
		"text": "occupied right hand occupied",
		"label": "unavailable",
		"bodypart": "r_hand"
	},
	{
		"text": "available left hand available",
		"label": "available",
		"bodypart": "l_hand"
	},
	{
		"text": "free left hand free",
		"label": "available",
		"bodypart": "l_hand"
	},
	{
		"text": "unavailable left hand unavailable",
		"label": "unavailable",
		"bodypart": "l_hand"
	},
	{
		"text": "occupied left hand occupied",
		"label": "unavailable",
		"bodypart": "l_hand"
	},
	{
		"text": "available leg available",
		"label": "available",
		"bodypart": "legs"
	},
	{
		"text": "free leg free",
		"label": "available",
		"bodypart": "legs"
	},
	{
		"text": "unavailable leg unavailable",
		"label": "unavailable",
		"bodypart": "legs"
	},
	{
		"text": "occupied leg occupied",
		"label": "unavailable",
		"bodypart": "legs"
	},
	{
		"text": "available feet available",
		"label": "available",
		"bodypart": "feet"
	},
	{
		"text": "free feet free",
		"label": "available",
		"bodypart": "feet"
	},
	{
		"text": "unavailable feet unavailable",
		"label": "unavailable",
		"bodypart": "feet"
	},
	{
		"text": "occupied feet occupied",
		"label": "unavailable",
		"bodypart": "feet"
	},
];