import { useState, useEffect, useCallback } from "react";

const EMOJI_SYMBOLS = {
  // ── Greetings & Social ──────────────────────────────────────────────────────
  greetings: [
    { id: 1,  label: "Hello",        emoji: "👋",  color: "#FFE066" },
    { id: 2,  label: "Goodbye",      emoji: "🤝",  color: "#FFE066" },
    { id: 3,  label: "Please",       emoji: "🙏",  color: "#FFE066" },
    { id: 4,  label: "Thank You",    emoji: "😊",  color: "#FFE066" },
    { id: 5,  label: "Yes",          emoji: "✅",  color: "#FFE066" },
    { id: 6,  label: "No",           emoji: "❌",  color: "#FFE066" },
    { id: 7,  label: "Help",         emoji: "🆘",  color: "#FFE066" },
    { id: 8,  label: "Sorry",        emoji: "😔",  color: "#FFE066" },
    { id: 9,  label: "Good Morning", emoji: "🌅",  color: "#FFE066" },
    { id: 10, label: "Good Night",   emoji: "🌙",  color: "#FFE066" },
    { id: 11, label: "How Are You",  emoji: "🤗",  color: "#FFE066" },
    { id: 12, label: "I'm Fine",     emoji: "👍",  color: "#FFE066" },
    { id: 13, label: "Wait",         emoji: "✋",  color: "#FFE066" },
    { id: 14, label: "Stop",         emoji: "🛑",  color: "#FFE066" },
    { id: 15, label: "Come Here",    emoji: "👆",  color: "#FFE066" },
    { id: 16, label: "Look",         emoji: "👀",  color: "#FFE066" },
    { id: 17, label: "Listen",       emoji: "👂",  color: "#FFE066" },
    { id: 18, label: "I Don't Know", emoji: "🤷",  color: "#FFE066" },
    { id: 19, label: "More",         emoji: "➕",  color: "#FFE066" },
    { id: 20, label: "Finished",     emoji: "🏁",  color: "#FFE066" },
  ],

  // ── Feelings & Emotions ─────────────────────────────────────────────────────
  feelings: [
    { id: 101, label: "Happy",      emoji: "😄", color: "#FF9F66" },
    { id: 102, label: "Sad",        emoji: "😢", color: "#FF9F66" },
    { id: 103, label: "Angry",      emoji: "😠", color: "#FF9F66" },
    { id: 104, label: "Scared",     emoji: "😨", color: "#FF9F66" },
    { id: 105, label: "Tired",      emoji: "😴", color: "#FF9F66" },
    { id: 106, label: "Excited",    emoji: "🤩", color: "#FF9F66" },
    { id: 107, label: "Confused",   emoji: "😕", color: "#FF9F66" },
    { id: 108, label: "Sick",       emoji: "🤒", color: "#FF9F66" },
    { id: 109, label: "Bored",      emoji: "😑", color: "#FF9F66" },
    { id: 110, label: "Loved",      emoji: "🥰", color: "#FF9F66" },
    { id: 111, label: "Frustrated", emoji: "😤", color: "#FF9F66" },
    { id: 112, label: "Surprised",  emoji: "😲", color: "#FF9F66" },
    { id: 113, label: "Proud",      emoji: "😎", color: "#FF9F66" },
    { id: 114, label: "Nervous",    emoji: "😬", color: "#FF9F66" },
    { id: 115, label: "Calm",       emoji: "😌", color: "#FF9F66" },
    { id: 116, label: "Silly",      emoji: "🤪", color: "#FF9F66" },
    { id: 117, label: "Worried",    emoji: "😟", color: "#FF9F66" },
    { id: 118, label: "Disgusted",  emoji: "🤢", color: "#FF9F66" },
    { id: 119, label: "Hungry",     emoji: "🍽️", color: "#FF9F66" },
    { id: 120, label: "Thirsty",    emoji: "🥤", color: "#FF9F66" },
    { id: 121, label: "Hot",        emoji: "🥵", color: "#FF9F66" },
    { id: 122, label: "Cold",       emoji: "🥶", color: "#FF9F66" },
    { id: 123, label: "In Pain",    emoji: "😣", color: "#FF9F66" },
    { id: 124, label: "Lonely",     emoji: "🥺", color: "#FF9F66" },
  ],

  // ── Food ────────────────────────────────────────────────────────────────────
  food: [
    { id: 201, label: "Breakfast",   emoji: "🍳",  color: "#FCA5A5" },
    { id: 202, label: "Lunch",       emoji: "🥗",  color: "#FCA5A5" },
    { id: 203, label: "Dinner",      emoji: "🍽️", color: "#FCA5A5" },
    { id: 204, label: "Snack",       emoji: "🍿",  color: "#FCA5A5" },
    { id: 205, label: "Apple",       emoji: "🍎",  color: "#FCA5A5" },
    { id: 206, label: "Banana",      emoji: "🍌",  color: "#FCA5A5" },
    { id: 207, label: "Orange",      emoji: "🍊",  color: "#FCA5A5" },
    { id: 208, label: "Grapes",      emoji: "🍇",  color: "#FCA5A5" },
    { id: 209, label: "Strawberry",  emoji: "🍓",  color: "#FCA5A5" },
    { id: 210, label: "Bread",       emoji: "🍞",  color: "#FCA5A5" },
    { id: 211, label: "Sandwich",    emoji: "🥪",  color: "#FCA5A5" },
    { id: 212, label: "Pizza",       emoji: "🍕",  color: "#FCA5A5" },
    { id: 213, label: "Burger",      emoji: "🍔",  color: "#FCA5A5" },
    { id: 214, label: "Pasta",       emoji: "🍝",  color: "#FCA5A5" },
    { id: 215, label: "Soup",        emoji: "🍜",  color: "#FCA5A5" },
    { id: 216, label: "Rice",        emoji: "🍚",  color: "#FCA5A5" },
    { id: 217, label: "Chicken",     emoji: "🍗",  color: "#FCA5A5" },
    { id: 218, label: "Salad",       emoji: "🥙",  color: "#FCA5A5" },
    { id: 219, label: "Eggs",        emoji: "🥚",  color: "#FCA5A5" },
    { id: 220, label: "Cheese",      emoji: "🧀",  color: "#FCA5A5" },
    { id: 221, label: "Yogurt",      emoji: "🫙",  color: "#FCA5A5" },
    { id: 222, label: "Cereal",      emoji: "🥣",  color: "#FCA5A5" },
    { id: 223, label: "Cookie",      emoji: "🍪",  color: "#FCA5A5" },
    { id: 224, label: "Cake",        emoji: "🎂",  color: "#FCA5A5" },
    { id: 225, label: "Ice Cream",   emoji: "🍦",  color: "#FCA5A5" },
    { id: 226, label: "Candy",       emoji: "🍬",  color: "#FCA5A5" },
    { id: 227, label: "Crackers",    emoji: "🫘",  color: "#FCA5A5" },
    { id: 228, label: "Hot Dog",     emoji: "🌭",  color: "#FCA5A5" },
    { id: 229, label: "Taco",        emoji: "🌮",  color: "#FCA5A5" },
    { id: 230, label: "Vegetables",  emoji: "🥦",  color: "#FCA5A5" },
  ],

  // ── Drinks ──────────────────────────────────────────────────────────────────
  drinks: [
    { id: 301, label: "Water",       emoji: "💧",  color: "#67E8F9" },
    { id: 302, label: "Milk",        emoji: "🥛",  color: "#67E8F9" },
    { id: 303, label: "Orange Juice",emoji: "🍊",  color: "#67E8F9" },
    { id: 304, label: "Apple Juice", emoji: "🍎",  color: "#67E8F9" },
    { id: 305, label: "Juice Box",   emoji: "🧃",  color: "#67E8F9" },
    { id: 306, label: "Soda",        emoji: "🥤",  color: "#67E8F9" },
    { id: 307, label: "Cola",        emoji: "🫙",  color: "#67E8F9" },
    { id: 308, label: "Lemonade",    emoji: "🍋",  color: "#67E8F9" },
    { id: 309, label: "Coffee",      emoji: "☕",  color: "#67E8F9" },
    { id: 310, label: "Hot Coffee",  emoji: "🫖",  color: "#67E8F9" },
    { id: 311, label: "Iced Coffee", emoji: "🧊",  color: "#67E8F9" },
    { id: 312, label: "Tea",         emoji: "🍵",  color: "#67E8F9" },
    { id: 313, label: "Hot Tea",     emoji: "🍵",  color: "#67E8F9" },
    { id: 314, label: "Iced Tea",    emoji: "🥤",  color: "#67E8F9" },
    { id: 315, label: "Hot Cocoa",   emoji: "🍫",  color: "#67E8F9" },
    { id: 316, label: "Smoothie",    emoji: "🫐",  color: "#67E8F9" },
    { id: 317, label: "Milkshake",   emoji: "🥤",  color: "#67E8F9" },
    { id: 318, label: "Sports Drink",emoji: "⚡",  color: "#67E8F9" },
    { id: 319, label: "Sparkling",   emoji: "✨",  color: "#67E8F9" },
    { id: 320, label: "Juice Drink", emoji: "🍹",  color: "#67E8F9" },
  ],

  // ── Daily Living (ADL) ──────────────────────────────────────────────────────
  daily: [
    { id: 401, label: "Wake Up",       emoji: "⏰", color: "#86EFAC" },
    { id: 402, label: "Get Dressed",   emoji: "👕", color: "#86EFAC" },
    { id: 403, label: "Brush Teeth",   emoji: "🪥", color: "#86EFAC" },
    { id: 404, label: "Wash Hands",    emoji: "🧼", color: "#86EFAC" },
    { id: 405, label: "Wash Face",     emoji: "🫧", color: "#86EFAC" },
    { id: 406, label: "Comb Hair",     emoji: "💇", color: "#86EFAC" },
    { id: 407, label: "Shower",        emoji: "🚿", color: "#86EFAC" },
    { id: 408, label: "Bath",          emoji: "🛁", color: "#86EFAC" },
    { id: 409, label: "Toilet",        emoji: "🚽", color: "#86EFAC" },
    { id: 410, label: "Eat Meal",      emoji: "🍽️",color: "#86EFAC" },
    { id: 411, label: "Drink",         emoji: "🥤", color: "#86EFAC" },
    { id: 412, label: "Take Medicine", emoji: "💊", color: "#86EFAC" },
    { id: 413, label: "Nap Time",      emoji: "😴", color: "#86EFAC" },
    { id: 414, label: "Bedtime",       emoji: "🛏️",color: "#86EFAC" },
    { id: 415, label: "Put on Shoes",  emoji: "👟", color: "#86EFAC" },
    { id: 416, label: "Put on Coat",   emoji: "🧥", color: "#86EFAC" },
    { id: 417, label: "Pack Bag",      emoji: "🎒", color: "#86EFAC" },
    { id: 418, label: "Clean Up",      emoji: "🧹", color: "#86EFAC" },
    { id: 419, label: "Laundry",       emoji: "🧺", color: "#86EFAC" },
    { id: 420, label: "Make Bed",      emoji: "🛏️",color: "#86EFAC" },
    { id: 421, label: "Cook",          emoji: "👨‍🍳",color: "#86EFAC" },
    { id: 422, label: "Wash Dishes",   emoji: "🍽️",color: "#86EFAC" },
    { id: 423, label: "Grocery Shop",  emoji: "🛒", color: "#86EFAC" },
    { id: 424, label: "Exercise",      emoji: "🏃", color: "#86EFAC" },
    { id: 425, label: "Stretch",       emoji: "🧘", color: "#86EFAC" },
    { id: 426, label: "Use Phone",     emoji: "📱", color: "#86EFAC" },
    { id: 427, label: "Watch TV",      emoji: "📺", color: "#86EFAC" },
    { id: 428, label: "Go Outside",    emoji: "🌳", color: "#86EFAC" },
    { id: 429, label: "Lock Door",     emoji: "🔒", color: "#86EFAC" },
    { id: 430, label: "Brush Hair",    emoji: "💆", color: "#86EFAC" },
  ],

  // ── Health & Body ────────────────────────────────────────────────────────────
  health: [
    { id: 501, label: "Head Hurts",     emoji: "🤕", color: "#FCD34D" },
    { id: 502, label: "Tummy Hurts",    emoji: "🤢", color: "#FCD34D" },
    { id: 503, label: "Throat Hurts",   emoji: "😷", color: "#FCD34D" },
    { id: 504, label: "Ear Hurts",      emoji: "👂", color: "#FCD34D" },
    { id: 505, label: "Tooth Hurts",    emoji: "🦷", color: "#FCD34D" },
    { id: 506, label: "Back Hurts",     emoji: "🦴", color: "#FCD34D" },
    { id: 507, label: "Leg Hurts",      emoji: "🦵", color: "#FCD34D" },
    { id: 508, label: "Arm Hurts",      emoji: "💪", color: "#FCD34D" },
    { id: 509, label: "Dizzy",          emoji: "💫", color: "#FCD34D" },
    { id: 510, label: "Nausea",         emoji: "🤮", color: "#FCD34D" },
    { id: 511, label: "Fever",          emoji: "🌡️",color: "#FCD34D" },
    { id: 512, label: "Coughing",       emoji: "😮‍💨",color:"#FCD34D"},
    { id: 513, label: "Sneezing",       emoji: "🤧", color: "#FCD34D" },
    { id: 514, label: "Itchy",          emoji: "😫", color: "#FCD34D" },
    { id: 515, label: "Medicine",       emoji: "💊", color: "#FCD34D" },
    { id: 516, label: "Doctor",         emoji: "👨‍⚕️",color:"#FCD34D"},
    { id: 517, label: "Hospital",       emoji: "🏥", color: "#FCD34D" },
    { id: 518, label: "Ambulance",      emoji: "🚑", color: "#FCD34D" },
    { id: 519, label: "Emergency",      emoji: "🆘", color: "#FCD34D" },
    { id: 520, label: "Need Rest",      emoji: "🛌", color: "#FCD34D" },
    { id: 521, label: "Tired/Fatigue",  emoji: "😩", color: "#FCD34D" },
    { id: 522, label: "Feeling Better", emoji: "😊", color: "#FCD34D" },
    { id: 523, label: "Wheelchair",     emoji: "♿", color: "#FCD34D" },
    { id: 524, label: "Therapy",        emoji: "🧠", color: "#FCD34D" },
  ],

  // ── Leisure & Fun ────────────────────────────────────────────────────────────
  leisure: [
    { id: 601, label: "Play",        emoji: "🎮", color: "#A78BFA" },
    { id: 602, label: "Read Book",   emoji: "📚", color: "#A78BFA" },
    { id: 603, label: "Draw",        emoji: "🎨", color: "#A78BFA" },
    { id: 604, label: "Color",       emoji: "🖍️",color: "#A78BFA" },
    { id: 605, label: "Music",       emoji: "🎵", color: "#A78BFA" },
    { id: 606, label: "Sing",        emoji: "🎤", color: "#A78BFA" },
    { id: 607, label: "Dance",       emoji: "🕺", color: "#A78BFA" },
    { id: 608, label: "Watch TV",    emoji: "📺", color: "#A78BFA" },
    { id: 609, label: "Movie",       emoji: "🎬", color: "#A78BFA" },
    { id: 610, label: "Puzzle",      emoji: "🧩", color: "#A78BFA" },
    { id: 611, label: "Board Game",  emoji: "🎲", color: "#A78BFA" },
    { id: 612, label: "Lego/Blocks", emoji: "🧱", color: "#A78BFA" },
    { id: 613, label: "Doll",        emoji: "🪆", color: "#A78BFA" },
    { id: 614, label: "Ball",        emoji: "⚽", color: "#A78BFA" },
    { id: 615, label: "Bike",        emoji: "🚲", color: "#A78BFA" },
    { id: 616, label: "Swim",        emoji: "🏊", color: "#A78BFA" },
    { id: 617, label: "Run",         emoji: "🏃", color: "#A78BFA" },
    { id: 618, label: "Playground",  emoji: "🛝", color: "#A78BFA" },
    { id: 619, label: "Park",        emoji: "🌿", color: "#A78BFA" },
    { id: 620, label: "Animals",     emoji: "🐾", color: "#A78BFA" },
    { id: 621, label: "Craft",       emoji: "✂️",color: "#A78BFA" },
    { id: 622, label: "Computer",    emoji: "💻", color: "#A78BFA" },
    { id: 623, label: "Video Game",  emoji: "🕹️",color: "#A78BFA" },
    { id: 624, label: "Tablet",      emoji: "📱", color: "#A78BFA" },
  ],

  // ── School & Learning ────────────────────────────────────────────────────────
  school: [
    { id: 701, label: "School",       emoji: "🏫", color: "#60A5FA" },
    { id: 702, label: "Class",        emoji: "🏛️",color: "#60A5FA" },
    { id: 703, label: "Teacher",      emoji: "👩‍🏫",color:"#60A5FA"},
    { id: 704, label: "Student",      emoji: "🧑‍🎓",color:"#60A5FA"},
    { id: 705, label: "Backpack",     emoji: "🎒", color: "#60A5FA" },
    { id: 706, label: "Pencil",       emoji: "✏️",color: "#60A5FA" },
    { id: 707, label: "Book",         emoji: "📖", color: "#60A5FA" },
    { id: 708, label: "Notebook",     emoji: "📓", color: "#60A5FA" },
    { id: 709, label: "Math",         emoji: "🔢", color: "#60A5FA" },
    { id: 710, label: "Reading",      emoji: "📚", color: "#60A5FA" },
    { id: 711, label: "Writing",      emoji: "✍️",color: "#60A5FA" },
    { id: 712, label: "Art",          emoji: "🎨", color: "#60A5FA" },
    { id: 713, label: "Music Class",  emoji: "🎵", color: "#60A5FA" },
    { id: 714, label: "Gym/PE",       emoji: "🏋️",color: "#60A5FA" },
    { id: 715, label: "Lunch Break",  emoji: "🍱", color: "#60A5FA" },
    { id: 716, label: "Recess",       emoji: "🛝", color: "#60A5FA" },
    { id: 717, label: "Bus",          emoji: "🚌", color: "#60A5FA" },
    { id: 718, label: "Homework",     emoji: "📝", color: "#60A5FA" },
    { id: 719, label: "Test",         emoji: "📋", color: "#60A5FA" },
    { id: 720, label: "Computer Lab", emoji: "💻", color: "#60A5FA" },
    { id: 721, label: "Library",      emoji: "📚", color: "#60A5FA" },
    { id: 722, label: "Bathroom",     emoji: "🚻", color: "#60A5FA" },
    { id: 723, label: "Nurse",        emoji: "🩺", color: "#60A5FA" },
    { id: 724, label: "Principal",    emoji: "🧑‍💼",color:"#60A5FA"},
  ],

  // ── Places ──────────────────────────────────────────────────────────────────
  places: [
    { id: 801, label: "Home",         emoji: "🏠", color: "#34D399" },
    { id: 802, label: "Bedroom",      emoji: "🛏️",color: "#34D399" },
    { id: 803, label: "Kitchen",      emoji: "🍳", color: "#34D399" },
    { id: 804, label: "Bathroom",     emoji: "🚿", color: "#34D399" },
    { id: 805, label: "Living Room",  emoji: "🛋️",color: "#34D399" },
    { id: 806, label: "Backyard",     emoji: "🌱", color: "#34D399" },
    { id: 807, label: "School",       emoji: "🏫", color: "#34D399" },
    { id: 808, label: "Hospital",     emoji: "🏥", color: "#34D399" },
    { id: 809, label: "Clinic",       emoji: "🩺", color: "#34D399" },
    { id: 810, label: "Pharmacy",     emoji: "💊", color: "#34D399" },
    { id: 811, label: "Grocery Store",emoji: "🛒", color: "#34D399" },
    { id: 812, label: "Restaurant",   emoji: "🍽️",color: "#34D399" },
    { id: 813, label: "Park",         emoji: "🌿", color: "#34D399" },
    { id: 814, label: "Playground",   emoji: "🛝", color: "#34D399" },
    { id: 815, label: "Library",      emoji: "📚", color: "#34D399" },
    { id: 816, label: "Church",       emoji: "⛪", color: "#34D399" },
    { id: 817, label: "Gym",          emoji: "🏋️",color: "#34D399" },
    { id: 818, label: "Pool",         emoji: "🏊", color: "#34D399" },
    { id: 819, label: "Beach",        emoji: "🏖️",color: "#34D399" },
    { id: 820, label: "Car",          emoji: "🚗", color: "#34D399" },
    { id: 821, label: "Bus",          emoji: "🚌", color: "#34D399" },
    { id: 822, label: "Airplane",     emoji: "✈️",color: "#34D399" },
    { id: 823, label: "Dentist",      emoji: "🦷", color: "#34D399" },
    { id: 824, label: "Therapy",      emoji: "🧠", color: "#34D399" },
  ],

  // ── People ──────────────────────────────────────────────────────────────────
  people: [
    { id: 901, label: "Me",           emoji: "🙋", color: "#F472B6" },
    { id: 902, label: "Mom",          emoji: "👩", color: "#F472B6" },
    { id: 903, label: "Dad",          emoji: "👨", color: "#F472B6" },
    { id: 904, label: "Grandma",      emoji: "👵", color: "#F472B6" },
    { id: 905, label: "Grandpa",      emoji: "👴", color: "#F472B6" },
    { id: 906, label: "Brother",      emoji: "👦", color: "#F472B6" },
    { id: 907, label: "Sister",       emoji: "👧", color: "#F472B6" },
    { id: 908, label: "Baby",         emoji: "👶", color: "#F472B6" },
    { id: 909, label: "Family",       emoji: "👨‍👩‍👧‍👦",color:"#F472B6"},
    { id: 910, label: "Friend",       emoji: "🧑", color: "#F472B6" },
    { id: 911, label: "Best Friend",  emoji: "🫂", color: "#F472B6" },
    { id: 912, label: "Caregiver",    emoji: "🧑‍🦽",color:"#F472B6"},
    { id: 913, label: "Doctor",       emoji: "👨‍⚕️",color:"#F472B6"},
    { id: 914, label: "Nurse",        emoji: "👩‍⚕️",color:"#F472B6"},
    { id: 915, label: "Teacher",      emoji: "👩‍🏫",color:"#F472B6"},
    { id: 916, label: "Therapist",    emoji: "🧠", color: "#F472B6" },
    { id: 917, label: "Neighbor",     emoji: "🏘️",color: "#F472B6" },
    { id: 918, label: "Classmate",    emoji: "🧑‍🎓",color:"#F472B6"},
    { id: 919, label: "Coach",        emoji: "🏅", color: "#F472B6" },
    { id: 920, label: "Aunt",         emoji: "👩‍🦰",color:"#F472B6"},
    { id: 921, label: "Uncle",        emoji: "👨‍🦰",color:"#F472B6"},
    { id: 922, label: "Pet",          emoji: "🐶", color: "#F472B6" },
  ],

  // ── Needs & Requests ────────────────────────────────────────────────────────  
needs: [
    { id: 1001, label: "I Want",       emoji: "🫳", color: "#C4B5FD" },
    { id: 1002, label: "I Need",       emoji: "❗", color: "#C4B5FD" },
    { id: 1003, label: "I Like",       emoji: "❤️",color: "#C4B5FD" },
    { id: 1004, label: "I Don't Like", emoji: "👎", color: "#C4B5FD" },
    { id: 1005, label: "Give Me",      emoji: "🙌", color: "#C4B5FD" },
    { id: 1006, label: "Take Away",    emoji: "↩️",color: "#C4B5FD" },
    { id: 1007, label: "Too Loud",     emoji: "🔇", color: "#C4B5FD" },
    { id: 1008, label: "Too Quiet",    emoji: "🔊", color: "#C4B5FD" },
    { id: 1009, label: "Too Hot",      emoji: "🔥", color: "#C4B5FD" },
    { id: 1010, label: "Too Cold",     emoji: "❄️",color: "#C4B5FD" },
    { id: 1011, label: "Comfortable",  emoji: "😌", color: "#C4B5FD" },
    { id: 1012, label: "Uncomfortable",emoji: "😫", color: "#C4B5FD" },
    { id: 1013, label: "Turn On",      emoji: "💡", color: "#C4B5FD" },
    { id: 1014, label: "Turn Off",     emoji: "🌑", color: "#C4B5FD" },
    { id: 1015, label: "Open",         emoji: "🔓", color: "#C4B5FD" },
    { id: 1016, label: "Close",        emoji: "🔐", color: "#C4B5FD" },
    { id: 1017, label: "Sit Down",     emoji: "🪑", color: "#C4B5FD" },
    { id: 1018, label: "Stand Up",     emoji: "🧍", color: "#C4B5FD" },
    { id: 1019, label: "Lie Down",     emoji: "🛌", color: "#C4B5FD" },
    { id: 1020, label: "Go Away",      emoji: "🚷", color: "#C4B5FD" },
    { id: 1021, label: "Come Back",    emoji: "↩️",color: "#C4B5FD" },
    { id: 1022, label: "Hug Me",       emoji: "🤗", color: "#C4B5FD" },
    { id: 1023, label: "Leave Me",     emoji: "✋", color: "#C4B5FD" },
    { id: 1024, label: "Change It",    emoji: "🔄", color: "#C4B5FD" },
  ],

  // ── Dungeons & Dragons ──────────────────────────────────────────────────────
  dnd: [
    { id: 1101, label: "Dragon",        emoji: "🐉", color: "#DC2626" },
    { id: 1102, label: "Wizard",        emoji: "🧙", color: "#DC2626" },
    { id: 1103, label: "Warrior",       emoji: "🗡️", color: "#DC2626" },
    { id: 1104, label: "Elf",           emoji: "🧝", color: "#DC2626" },
    { id: 1105, label: "Dwarf",         emoji: "⛏️", color: "#DC2626" },
    { id: 1106, label: "Orc",           emoji: "👹", color: "#DC2626" },
    { id: 1107, label: "Goblin",        emoji: "👺", color: "#DC2626" },
    { id: 1108, label: "Skeleton",      emoji: "💀", color: "#DC2626" },
    { id: 1109, label: "Ghost",         emoji: "👻", color: "#DC2626" },
    { id: 1110, label: "Vampire",       emoji: "🧛", color: "#DC2626" },
    { id: 1111, label: "Werewolf",      emoji: "🐺", color: "#DC2626" },
    { id: 1112, label: "Troll",         emoji: "🧌", color: "#DC2626" },
    { id: 1113, label: "Unicorn",       emoji: "🦄", color: "#DC2626" },
    { id: 1114, label: "Phoenix",       emoji: "🦅", color: "#DC2626" },
    { id: 1115, label: "Sword",         emoji: "⚔️", color: "#DC2626" },
    { id: 1116, label: "Staff",         emoji: "🪄", color: "#DC2626" },
    { id: 1117, label: "Bow & Arrow",   emoji: "🏹", color: "#DC2626" },
    { id: 1118, label: "Shield",        emoji: "🛡️", color: "#DC2626" },
    { id: 1119, label: "Dagger",        emoji: "🔪", color: "#DC2626" },
    { id: 1120, label: "Axe",           emoji: "🪓", color: "#DC2626" },
    { id: 1121, label: "Magic Spell",   emoji: "✨", color: "#DC2626" },
    { id: 1122, label: "Fireball",      emoji: "🔥", color: "#DC2626" },
    { id: 1123, label: "Ice Spell",     emoji: "❄️", color: "#DC2626" },
    { id: 1124, label: "Lightning",     emoji: "⚡", color: "#DC2626" },
    { id: 1125, label: "Poison",        emoji: "☠️", color: "#DC2626" },
    { id: 1126, label: "Healing",       emoji: "💚", color: "#DC2626" },
    { id: 1127, label: "Potion",        emoji: "🧪", color: "#DC2626" },
    { id: 1128, label: "Treasure",      emoji: "💰", color: "#DC2626" },
    { id: 1129, label: "Chest",         emoji: "📦", color: "#DC2626" },
    { id: 1130, label: "Map",           emoji: "🗺️", color: "#DC2626" },
    { id: 1131, label: "Dungeon",       emoji: "🏰", color: "#DC2626" },
    { id: 1132, label: "Castle",        emoji: "🏯", color: "#DC2626" },
    { id: 1133, label: "Cave",          emoji: "🕳️", color: "#DC2626" },
    { id: 1134, label: "Forest",        emoji: "🌲", color: "#DC2626" },
    { id: 1135, label: "Tavern",        emoji: "🍺", color: "#DC2626" },
    { id: 1136, label: "Roll Dice",     emoji: "🎲", color: "#DC2626" },
    { id: 1137, label: "Nat 20!",       emoji: "🎯", color: "#DC2626" },
    { id: 1138, label: "Critical Fail", emoji: "💥", color: "#DC2626" },
    { id: 1139, label: "Level Up",      emoji: "⬆️", color: "#DC2626" },
    { id: 1140, label: "Experience",    emoji: "⭐", color: "#DC2626" },
    { id: 1141, label: "Quest",         emoji: "📜", color: "#DC2626" },
    { id: 1142, label: "Campfire",      emoji: "🔥", color: "#DC2626" },
    { id: 1143, label: "Torch",         emoji: "🔦", color: "#DC2626" },
    { id: 1144, label: "Spider",        emoji: "🕷️", color: "#DC2626" },
    { id: 1145, label: "Bat",           emoji: "🦇", color: "#DC2626" },
    { id: 1146, label: "Snake",         emoji: "🐍", color: "#DC2626" },
    { id: 1147, label: "Spell Book",    emoji: "📖", color: "#DC2626" },
    { id: 1148, label: "Rogue",         emoji: "🥷", color: "#DC2626" },
  ],
};

const CATEGORIES = [
  { id: "greetings", label: "Greetings",   emoji: "👋", color: "#FFE066" },
  { id: "feelings",  label: "Feelings",    emoji: "😊", color: "#FF9F66" },
  { id: "food",      label: "Food",        emoji: "🍎", color: "#FCA5A5" },
  { id: "drinks",    label: "Drinks",      emoji: "🥤", color: "#67E8F9" },
  { id: "daily",     label: "Daily Living",emoji: "🪥", color: "#86EFAC" },
  { id: "health",    label: "Health",      emoji: "💊", color: "#FCD34D" },
  { id: "leisure",   label: "Leisure",     emoji: "🎮", color: "#A78BFA" },
  { id: "school",    label: "School",      emoji: "🏫", color: "#60A5FA" },
  { id: "places",    label: "Places",      emoji: "🏠", color: "#34D399" },
  { id: "people",    label: "People",      emoji: "👩", color: "#F472B6" },
  { id: "needs",     label: "Needs",       emoji: "❗", color: "#C4B5FD" },
  { id: "dnd",       label: "D&D",         emoji: "🐉", color: "#DC2626" },
];

const VOICES = [
  { id: "female1", label: "Aria", description: "Warm & Friendly", pitch: 1.1, rate: 0.95 },
  { id: "male1", label: "Marcus", description: "Deep & Clear", pitch: 0.85, rate: 0.9 },
  { id: "female2", label: "Zoe", description: "Bright & Energetic", pitch: 1.2, rate: 1.05 },
  { id: "male2", label: "Oliver", description: "Calm & Steady", pitch: 0.95, rate: 0.88 },
  { id: "child", label: "Sam", description: "Youthful & Light", pitch: 1.3, rate: 1.0 },
];

const GRID_SIZES = [
  { label: "2×2", cols: 2, cells: 4 },
  { label: "2×3", cols: 3, cells: 6 },
  { label: "3×3", cols: 3, cells: 9 },
  { label: "3×4", cols: 4, cells: 12 },
  { label: "4×4", cols: 4, cells: 16 },
  { label: "4×5", cols: 5, cells: 20 },
];

const BOARD_COLORS = ["#6366F1","#EC4899","#F59E0B","#10B981","#3B82F6","#EF4444","#8B5CF6","#14B8A6"];
const BOARD_EMOJIS = ["⭐","🌟","💛","❤️","💙","💚","🎯","🎨","🌈","🏠","🎒","🍎","🎵","🌸","🐶","😊"];

const getAllSymbols = () => Object.values(EMOJI_SYMBOLS).flat();

export default function AACBoard() {
  const [view, setView] = useState("board");
  const [activeCategory, setActiveCategory] = useState("greetings");
  const [message, setMessage] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [speaking, setSpeaking] = useState(false);
  const [theme, setTheme] = useState("light");
  const [settingsTab, setSettingsTab] = useState("display");
  const [tileSize, setTileSize] = useState(108);
  const [activeBoard, setActiveBoard] = useState(null);

  const [savedBoards, setSavedBoards] = useState([
    {
      id: "default-morning", name: "Morning Routine", color: "#6366F1", emoji: "🌅",
      gridSize: GRID_SIZES[2],
      cells: {
        0: EMOJI_SYMBOLS.greetings[8],  // Good Morning
        1: EMOJI_SYMBOLS.daily[0],      // Wake Up
        2: EMOJI_SYMBOLS.daily[2],      // Brush Teeth
        3: EMOJI_SYMBOLS.daily[3],      // Wash Hands
        4: EMOJI_SYMBOLS.daily[1],      // Get Dressed
        5: EMOJI_SYMBOLS.food[0],       // Breakfast
        6: EMOJI_SYMBOLS.drinks[0],     // Water
        7: EMOJI_SYMBOLS.daily[14],     // Put on Shoes
        8: EMOJI_SYMBOLS.daily[16],     // Pack Bag
      },
    },
    {
      id: "default-feelings", name: "How I Feel", color: "#EC4899", emoji: "💭",
      gridSize: GRID_SIZES[2],
      cells: {
        0: EMOJI_SYMBOLS.feelings[0],  // Happy
        1: EMOJI_SYMBOLS.feelings[1],  // Sad
        2: EMOJI_SYMBOLS.feelings[2],  // Angry
        3: EMOJI_SYMBOLS.feelings[3],  // Scared
        4: EMOJI_SYMBOLS.feelings[4],  // Tired
        5: EMOJI_SYMBOLS.feelings[5],  // Excited
        6: EMOJI_SYMBOLS.feelings[8],  // Bored
        7: EMOJI_SYMBOLS.feelings[22], // In Pain
        8: EMOJI_SYMBOLS.needs[1],     // I Need
      },
    },
  ]);

  // Builder state
  const [builderCells, setBuilderCells] = useState({});
  const [builderGridSize, setBuilderGridSize] = useState(GRID_SIZES[2]);
  const [builderName, setBuilderName] = useState("");
  const [builderColor, setBuilderColor] = useState(BOARD_COLORS[0]);
  const [builderEmoji, setBuilderEmoji] = useState("⭐");
  const [builderCategory, setBuilderCategory] = useState("greetings");
  const [builderSearch, setBuilderSearch] = useState("");
  const [dragSymbol, setDragSymbol] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState(null);

  const sz = {
    tile: tileSize,
    font: Math.max(10, Math.round(10 + (tileSize - 70) * 0.11)),
    emoji: Math.max(22, Math.round(22 + (tileSize - 70) * 0.46)),
  };

  const THEMES = {
    light: { bg: "#F8F7FF", panel: "#FFFFFF", text: "#1A1A2E", subtext: "#6B7280", border: "#E5E7EB", msgBg: "#EEF2FF", shadow: "rgba(0,0,0,0.07)" },
    dark: { bg: "#0F0F1A", panel: "#1A1A2E", text: "#F3F4F6", subtext: "#9CA3AF", border: "#2D2D45", msgBg: "#1E1E3A", shadow: "rgba(0,0,0,0.3)" },
    highcontrast: { bg: "#000000", panel: "#111111", text: "#FFFFFF", subtext: "#FFFF00", border: "#FFFFFF", msgBg: "#0A0A0A", shadow: "rgba(255,255,255,0.2)" },
  };
  const T = THEMES[theme];

  useEffect(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      setSearchResults(getAllSymbols().filter(s => s.label.toLowerCase().includes(q)));
    } else setSearchResults([]);
  }, [searchQuery]);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setSpeaking(true);
    const u = new SpeechSynthesisUtterance(text);
    u.pitch = selectedVoice.pitch; u.rate = selectedVoice.rate;
    u.onend = () => setSpeaking(false); u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, [selectedVoice]);

  const handleTilePress = (symbol) => { setMessage(p => [...p, symbol]); speak(symbol.label); };

  const openBuilderNew = () => {
    setBuilderCells({}); setBuilderName(""); setBuilderColor(BOARD_COLORS[0]);
    setBuilderEmoji("⭐"); setBuilderGridSize(GRID_SIZES[2]);
    setBuilderCategory("greetings"); setBuilderSearch(""); setEditingBoardId(null);
    setView("builder");
  };

  const openBuilderEdit = (board) => {
    setBuilderCells({ ...board.cells }); setBuilderName(board.name);
    setBuilderColor(board.color); setBuilderEmoji(board.emoji);
    setBuilderGridSize(board.gridSize); setEditingBoardId(board.id);
    setBuilderCategory("greetings"); setBuilderSearch("");
    setView("builder");
  };

  const saveBoard = () => {
    if (!builderName.trim()) return;
    const board = { id: editingBoardId || `board-${Date.now()}`, name: builderName.trim(), color: builderColor, emoji: builderEmoji, gridSize: builderGridSize, cells: builderCells };
    setSavedBoards(p => editingBoardId ? p.map(b => b.id === editingBoardId ? board : b) : [...p, board]);
    setEditingBoardId(board.id);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const deleteBoard = (id) => { setSavedBoards(p => p.filter(b => b.id !== id)); if (activeBoard?.id === id) setActiveBoard(null); };

  // Drag & drop
  const handleDragStart = (sym, fromCell) => setDragSymbol(fromCell !== undefined ? { ...sym, _fromCell: fromCell } : sym);
  const handleDragOver = (e, idx) => { e.preventDefault(); setDragOverCell(idx); };
  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (!dragSymbol) return;
    const { _fromCell, ...sym } = dragSymbol;
    setBuilderCells(prev => {
      const next = { ...prev };
      if (_fromCell !== undefined) delete next[_fromCell];
      next[idx] = sym;
      return next;
    });
    setDragSymbol(null); setDragOverCell(null);
  };
  const handleDragEnd = () => { setDragSymbol(null); setDragOverCell(null); };
  const removeFromCell = (idx) => setBuilderCells(p => { const n = {...p}; delete n[idx]; return n; });

  const builderSymbols = builderSearch.trim()
    ? getAllSymbols().filter(s => s.label.toLowerCase().includes(builderSearch.toLowerCase()))
    : (EMOJI_SYMBOLS[builderCategory] || []);

  const boardSymbols = searchQuery ? searchResults
    : activeBoard ? Object.values(activeBoard.cells)
    : (EMOJI_SYMBOLS[activeCategory] || []);

  // ─── Common Styles ───────────────────────────────────────────────────────────
  const css = {
    app: { fontFamily:"'Nunito',sans-serif", background:T.bg, minHeight:"100vh", display:"flex", flexDirection:"column", maxWidth:900, margin:"0 auto", color:T.text, transition:"background 0.3s,color 0.3s" },
    header: { background:T.panel, borderBottom:`1px solid ${T.border}`, padding:"10px 16px 0", boxShadow:`0 2px 12px ${T.shadow}`, position:"sticky", top:0, zIndex:100 },
    topBar: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 },
    appTitle: { fontSize:18, fontWeight:800, background:"linear-gradient(135deg,#6366F1,#8B5CF6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" },
    msgBar: { background:T.msgBg, border:`2px solid ${theme==="highcontrast"?"#FFFF00":"#C7D2FE"}`, borderRadius:14, padding:"8px 12px", marginBottom:10, display:"flex", alignItems:"center", gap:8, minHeight:54 },
    token: { background:"#6366F1", color:"#fff", borderRadius:20, padding:"3px 10px", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:4 },
    smallBtn: { background:T.border, border:"none", borderRadius:8, padding:"5px 8px", cursor:"pointer", fontSize:15, color:T.text },
    searchRow: { display:"flex", alignItems:"center", gap:8, background:T.bg, border:`2px solid ${T.border}`, borderRadius:12, padding:"7px 12px", marginBottom:10 },
    input: { border:"none", background:"none", outline:"none", flex:1, fontSize:14, color:T.text, fontFamily:"inherit" },
    navTabs: { display:"flex", gap:4, overflowX:"auto" },
    body: { flex:1, padding:"12px 12px 90px", overflowY:"auto" },
    grid: { display:"flex", flexWrap:"wrap", gap:10 },
    bottomNav: { position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:900, background:T.panel, borderTop:`1px solid ${T.border}`, display:"flex", padding:"8px 8px 12px", gap:4, zIndex:200, boxShadow:`0 -4px 20px ${T.shadow}` },
    navBtn: (on) => ({ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, background:"none", border:"none", cursor:"pointer", padding:"6px 0", borderRadius:10, color:on?"#6366F1":T.subtext, fontFamily:"inherit" }),
    card: { background:T.panel, borderRadius:16, padding:16, boxShadow:`0 4px 20px ${T.shadow}` },
    label: { fontSize:11, fontWeight:700, color:T.subtext, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8, marginTop:14, display:"block" },
    formInput: { background:T.bg, border:`2px solid ${T.border}`, borderRadius:10, padding:"9px 13px", fontSize:15, fontWeight:700, color:T.text, fontFamily:"inherit", outline:"none", width:"100%", boxSizing:"border-box" },
    sTab: (id) => ({ padding:"8px 14px", fontWeight:700, fontSize:13, cursor:"pointer", border:"none", background:"none", color:settingsTab===id?"#6366F1":T.subtext, borderBottom:settingsTab===id?"2px solid #6366F1":"2px solid transparent", fontFamily:"inherit" }),
  };

  return (
    <div style={css.app}>

      {/* ══ BOARD & MY BOARDS HEADER ══ */}
      {(view === "board" || view === "myboards") && (
        <div style={css.header}>
          <div style={css.topBar}>
            <span style={css.appTitle}>⚔️ Lord Darren the Staff Wielder of Magical Apps</span>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              {activeBoard && (
                <>
                  <span style={{ fontSize:12, background:`${activeBoard.color}22`, color:activeBoard.color, border:`1px solid ${activeBoard.color}55`, borderRadius:20, padding:"2px 10px", fontWeight:800 }}>
                    {activeBoard.emoji} {activeBoard.name}
                  </span>
                  <button style={css.smallBtn} onClick={() => setActiveBoard(null)} title="Back to full library">✕</button>
                </>
              )}
              {speaking && <span style={{ fontSize:12, color:"#6366F1", fontWeight:700 }}>🔊 Speaking…</span>}
            </div>
          </div>

          {/* Message Bar */}
          <div style={css.msgBar}>
            <div style={{ flex:1, display:"flex", flexWrap:"wrap", gap:6, alignItems:"center" }}>
              {message.length === 0
                ? <span style={{ color:T.subtext, fontSize:13, fontStyle:"italic" }}>Tap symbols to build a message…</span>
                : message.map((s,i) => <span key={i} style={css.token}>{s.emoji} {s.label}</span>)
              }
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button style={css.smallBtn} onClick={() => setMessage(p=>p.slice(0,-1))}>⌫</button>
              <button style={css.smallBtn} onClick={() => { setMessage([]); window.speechSynthesis?.cancel(); setSpeaking(false); }}>🗑️</button>
              <button
                style={{ background:speaking?"linear-gradient(135deg,#F59E0B,#EF4444)":"linear-gradient(135deg,#6366F1,#8B5CF6)", color:"#fff", border:"none", borderRadius:10, padding:"7px 14px", fontWeight:800, fontSize:13, cursor:"pointer", whiteSpace:"nowrap" }}
                onClick={() => { if (message.length) speak(message.map(s=>s.label).join(" ")); }}
                disabled={message.length===0}
              >
                {speaking ? "⏹ Stop" : "▶ Speak"}
              </button>
            </div>
          </div>

          {view === "board" && (
            <>
              <div style={css.searchRow}>
                <span>🔍</span>
                <input style={css.input} placeholder="Search all symbols…" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} />
                {searchQuery && <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:15 }} onClick={()=>setSearchQuery("")}>✕</button>}
              </div>

              {/* Size slider */}
              <div style={{ display:"flex", alignItems:"center", gap:10, padding:"5px 2px 8px", borderBottom:`1px solid ${T.border}` }}>
                <span style={{ fontSize:13, color:T.subtext, fontWeight:700, whiteSpace:"nowrap" }}>🔲 Icon Size</span>
                <span style={{ fontSize:13, fontWeight:900 }}>A</span>
                <input type="range" min={70} max={350} step={5} value={tileSize} onChange={e=>setTileSize(Number(e.target.value))}
                  style={{ flex:1, accentColor:"#6366F1", cursor:"pointer" }} />
                <span style={{ fontSize:24, fontWeight:900 }}>A</span>
                <span style={{ fontSize:11, fontWeight:800, color:"#6366F1", background:"#EEF2FF", borderRadius:6, padding:"2px 7px", minWidth:32, textAlign:"center" }}>
                  {tileSize<100?"XS":tileSize<130?"S":tileSize<175?"M":tileSize<230?"L":tileSize<290?"XL":"XXL"}
                </span>
              </div>

              {/* Category tabs – hide when viewing a saved board */}
              {!searchQuery && !activeBoard && (
                <div style={css.navTabs}>
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} style={{
                      flexShrink:0, background:activeCategory===cat.id?cat.color:"none", border:"none",
                      borderRadius:"10px 10px 0 0", padding:"7px 12px", fontWeight:700, fontSize:12,
                      cursor:"pointer", color:activeCategory===cat.id?"#1A1A2E":T.subtext, display:"flex", alignItems:"center", gap:5
                    }} onClick={()=>setActiveCategory(cat.id)}>
                      <span>{cat.emoji}</span><span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══ BODY ══ */}
      <div style={css.body}>

        {/* BOARD */}
        {view === "board" && (
          <div style={css.grid}>
            {boardSymbols.length === 0 && searchQuery && (
              <div style={{ textAlign:"center", padding:40, color:T.subtext, width:"100%" }}>
                <div style={{ fontSize:48 }}>🔍</div>
                <p style={{ fontWeight:700, marginTop:12 }}>No symbols found</p>
              </div>
            )}
            {boardSymbols.map((sym,i) => (
              <SymbolTile key={`${sym.id}-${i}`} symbol={sym} sz={sz} T={T} theme={theme} onPress={() => handleTilePress(sym)} />
            ))}
          </div>
        )}

        {/* MY BOARDS */}
        {view === "myboards" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div>
                <div style={{ fontSize:20, fontWeight:900 }}>📋 My Boards</div>
                <div style={{ fontSize:13, color:T.subtext, marginTop:2 }}>{savedBoards.length} saved board{savedBoards.length!==1?"s":""}</div>
              </div>
              <button onClick={openBuilderNew} style={{ background:"linear-gradient(135deg,#6366F1,#8B5CF6)", color:"#fff", border:"none", borderRadius:12, padding:"10px 18px", fontWeight:800, fontSize:14, cursor:"pointer" }}>
                ＋ New Board
              </button>
            </div>

            {savedBoards.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 20px", color:T.subtext }}>
                <div style={{ fontSize:56 }}>📝</div>
                <p style={{ fontWeight:700, fontSize:16, marginTop:12 }}>No boards yet</p>
                <p style={{ fontSize:13, marginTop:6 }}>Tap "New Board" to create your first custom board</p>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))", gap:12 }}>
                {savedBoards.map(board => (
                  <BoardCard key={board.id} board={board} T={T}
                    onLoad={() => { setActiveBoard(board); setView("board"); setSearchQuery(""); }}
                    onEdit={() => openBuilderEdit(board)}
                    onDelete={() => deleteBoard(board.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* BUILDER */}
        {view === "builder" && (
          <BuilderView
            T={T} theme={theme}
            builderCells={builderCells} setBuilderCells={setBuilderCells}
            builderGridSize={builderGridSize} setBuilderGridSize={setBuilderGridSize}
            builderName={builderName} setBuilderName={setBuilderName}
            builderColor={builderColor} setBuilderColor={setBuilderColor}
            builderEmoji={builderEmoji} setBuilderEmoji={setBuilderEmoji}
            builderCategory={builderCategory} setBuilderCategory={setBuilderCategory}
            builderSearch={builderSearch} setBuilderSearch={setBuilderSearch}
            builderSymbols={builderSymbols}
            dragOverCell={dragOverCell}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleDragEnd={handleDragEnd}
            removeFromCell={removeFromCell}
            saveBoard={saveBoard} saveSuccess={saveSuccess} editingBoardId={editingBoardId}
            css={css} BOARD_COLORS={BOARD_COLORS} BOARD_EMOJIS={BOARD_EMOJIS}
            GRID_SIZES={GRID_SIZES} CATEGORIES={CATEGORIES}
          />
        )}

        {/* SETTINGS */}
        {view === "settings" && (
          <div style={css.card}>
            <div style={{ fontSize:18, fontWeight:900, marginBottom:14 }}>⚙️ Settings</div>
            <div style={{ display:"flex", borderBottom:`1px solid ${T.border}`, marginBottom:18 }}>
              {["display","voice","theme"].map(tab => (
                <button key={tab} style={css.sTab(tab)} onClick={()=>setSettingsTab(tab)}>
                  {tab==="display"?"📐 Display":tab==="voice"?"🔊 Voice":"🎨 Theme"}
                </button>
              ))}
            </div>

            {settingsTab === "display" && (
              <>
                <span style={css.label}>Icon Size</span>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ fontWeight:900 }}>A</span>
                  <input type="range" min={70} max={350} step={5} value={tileSize} onChange={e=>setTileSize(Number(e.target.value))}
                    style={{ flex:1, accentColor:"#6366F1", cursor:"pointer" }} />
                  <span style={{ fontWeight:900, fontSize:26 }}>A</span>
                </div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {[{l:"XS",v:80},{l:"S",v:108},{l:"M",v:140},{l:"L",v:190},{l:"XL",v:250},{l:"XXL",v:320}].map(({l,v})=>(
                    <button key={l} onClick={()=>setTileSize(v)} style={{ flex:1, minWidth:46, padding:"8px 4px", border:`2px solid ${tileSize===v?"#6366F1":T.border}`, borderRadius:10, background:tileSize===v?"#EEF2FF":T.bg, color:tileSize===v?"#6366F1":T.text, fontWeight:800, fontSize:12, cursor:"pointer", fontFamily:"inherit" }}>
                      {l}
                    </button>
                  ))}
                </div>
                <div style={{ fontSize:12, color:T.subtext, marginTop:10, background:`${T.border}55`, borderRadius:8, padding:"6px 10px" }}>
                  💡 XL & XXL ideal for low vision or limited motor control.
                </div>
              </>
            )}

            {settingsTab === "voice" && VOICES.map(v => (
              <div key={v.id} onClick={()=>setSelectedVoice(v)} style={{ display:"flex", alignItems:"center", padding:"10px 14px", borderRadius:12, border:`2px solid ${selectedVoice.id===v.id?"#6366F1":T.border}`, background:selectedVoice.id===v.id?"#EEF2FF":T.bg, cursor:"pointer", marginBottom:8, gap:12 }}>
                <div style={{ width:38,height:38,borderRadius:"50%",background:selectedVoice.id===v.id?"linear-gradient(135deg,#6366F1,#8B5CF6)":T.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>🔊</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800,fontSize:14 }}>{v.label}</div>
                  <div style={{ fontSize:12,color:T.subtext }}>{v.description}</div>
                </div>
                <button style={{ background:"linear-gradient(135deg,#6366F1,#8B5CF6)",color:"#fff",border:"none",borderRadius:8,padding:"5px 11px",fontWeight:700,fontSize:12,cursor:"pointer" }}
                  onClick={e=>{e.stopPropagation();const u=new SpeechSynthesisUtterance(`Hi, I'm ${v.label}`);u.pitch=v.pitch;u.rate=v.rate;window.speechSynthesis?.speak(u);}}>
                  ▶ Test
                </button>
              </div>
            ))}

            {settingsTab === "theme" && (
              <div style={{ display:"flex", gap:8 }}>
                {[{id:"light",label:"☀️ Light"},{id:"dark",label:"🌙 Dark"},{id:"highcontrast",label:"⬛ High Contrast"}].map(t=>(
                  <button key={t.id} onClick={()=>setTheme(t.id)} style={{ flex:1,padding:"14px 8px",borderRadius:12,border:`2px solid ${theme===t.id?"#6366F1":T.border}`,background:t.id==="light"?"#F8F7FF":t.id==="dark"?"#0F0F1A":"#000",color:t.id==="light"?"#1A1A2E":"#fff",fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>
                    <div style={{ fontSize:22,marginBottom:4 }}>{t.label.split(" ")[0]}</div>
                    {t.label.split(" ").slice(1).join(" ")}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══ BOTTOM NAV ══ */}
      <div style={css.bottomNav}>
        {[
          { id:"board", icon:"🎯", label:"Board" },
          { id:"myboards", icon:"📋", label:"My Boards" },
          { id:"builder", icon:"✏️", label:"Builder" },
          { id:"settings", icon:"⚙️", label:"Settings" },
        ].map(item => (
          <button key={item.id} style={css.navBtn(view===item.id)}
            onClick={()=>{ if(item.id==="builder" && view!=="builder") openBuilderNew(); else setView(item.id); }}>
            <span style={{ fontSize:22 }}>{item.icon}</span>
            <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em" }}>{item.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-thumb{background:#C7D2FE;border-radius:10px}
        @keyframes pop{from{transform:scale(0.92);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes slideUp{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      `}</style>
    </div>
  );
}

// ─── Symbol Tile ───────────────────────────────────────────────────────────────
function SymbolTile({ symbol, sz, T, theme, onPress, draggable, onDragStart, onDragEnd, compact }) {
  const [pressed, setPressed] = useState(false);
  const w = compact ? 72 : sz.tile;
  const ef = compact ? 26 : sz.emoji;
  const ff = compact ? 9 : sz.font;
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => { if (!draggable) { setPressed(true); setTimeout(()=>setPressed(false),150); onPress?.(); } }}
      onMouseDown={()=>setPressed(true)}
      onMouseUp={()=>setPressed(false)}
      onMouseLeave={()=>setPressed(false)}
      style={{
        width:w, height:w,
        background: theme==="highcontrast"?"#111":`${symbol.color}22`,
        border: theme==="highcontrast"?"2px solid #fff":`2px solid ${symbol.color}66`,
        borderRadius:14, display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", cursor:draggable?"grab":"pointer",
        gap:4, userSelect:"none", flexShrink:0,
        transform:pressed?"scale(0.91)":"scale(1)",
        boxShadow:pressed?`0 1px 4px rgba(0,0,0,0.1)`:`0 2px 8px rgba(0,0,0,0.07)`,
        transition:"transform 0.1s, box-shadow 0.1s",
        animation:"pop 0.15s ease",
      }}
    >
      <span style={{ fontSize:ef, lineHeight:1 }}>{symbol.emoji}</span>
      <span style={{ fontSize:ff, fontWeight:800, textAlign:"center", lineHeight:1.2, color:T.text, padding:"0 3px", maxWidth:"95%" }}>{symbol.label}</span>
    </div>
  );
}

// ─── Board Card ────────────────────────────────────────────────────────────────
function BoardCard({ board, T, onLoad, onEdit, onDelete }) {
  const preview = Object.values(board.cells).slice(0, 6);
  return (
    <div style={{ background:T.panel, borderRadius:16, overflow:"hidden", boxShadow:`0 4px 16px rgba(0,0,0,0.07)`, border:`1px solid ${T.border}`, animation:"slideUp 0.2s ease" }}>
      <div style={{ background:`${board.color}18`, borderBottom:`3px solid ${board.color}`, padding:"12px 14px", display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:28 }}>{board.emoji}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:900, fontSize:15, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{board.name}</div>
          <div style={{ fontSize:11, color:T.subtext, marginTop:2 }}>{board.gridSize.label} · {Object.keys(board.cells).length} icons</div>
        </div>
      </div>
      <div style={{ padding:10, display:"flex", flexWrap:"wrap", gap:5, minHeight:80, background:T.bg }}>
        {preview.map((sym,i) => (
          <div key={i} style={{ width:52,height:52,background:`${sym.color}22`,border:`2px solid ${sym.color}55`,borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2 }}>
            <span style={{ fontSize:22 }}>{sym.emoji}</span>
            <span style={{ fontSize:8,fontWeight:800,color:T.text,textAlign:"center",padding:"0 2px",lineHeight:1.1 }}>{sym.label}</span>
          </div>
        ))}
        {preview.length===0 && <span style={{ fontSize:12,color:T.subtext,padding:"10px 0" }}>Empty board</span>}
      </div>
      <div style={{ display:"flex", borderTop:`1px solid ${T.border}` }}>
        <button onClick={onLoad} style={{ flex:1,background:"none",border:"none",padding:"10px 0",fontWeight:800,fontSize:13,color:"#6366F1",cursor:"pointer",fontFamily:"inherit",borderRight:`1px solid ${T.border}` }}>▶ Open</button>
        <button onClick={onEdit} style={{ flex:1,background:"none",border:"none",padding:"10px 0",fontWeight:800,fontSize:13,color:T.subtext,cursor:"pointer",fontFamily:"inherit",borderRight:`1px solid ${T.border}` }}>✏️ Edit</button>
        <button onClick={onDelete} style={{ flex:1,background:"none",border:"none",padding:"10px 0",fontWeight:800,fontSize:13,color:"#EF4444",cursor:"pointer",fontFamily:"inherit" }}>🗑️</button>
      </div>
    </div>
  );
}

// ─── Builder View ──────────────────────────────────────────────────────────────
function BuilderView({ T, theme, builderCells, setBuilderCells, builderGridSize, setBuilderGridSize, builderName, setBuilderName, builderColor, setBuilderColor, builderEmoji, setBuilderEmoji, builderCategory, setBuilderCategory, builderSearch, setBuilderSearch, builderSymbols, dragOverCell, handleDragStart, handleDragOver, handleDrop, handleDragEnd, removeFromCell, saveBoard, saveSuccess, editingBoardId, css, BOARD_COLORS, BOARD_EMOJIS, GRID_SIZES, CATEGORIES }) {

  const handleCellDragStart = (e, idx) => { e.stopPropagation(); handleDragStart(builderCells[idx], idx); };
  const handleCellDrop = (e, idx) => handleDrop(e, idx);

  return (
    <div style={{ background:T.panel, borderRadius:16, overflow:"hidden", boxShadow:`0 4px 20px rgba(0,0,0,0.08)` }}>

      {/* ── Board Info ── */}
      <div style={{ padding:"14px 16px", borderBottom:`1px solid ${T.border}`, background:`${builderColor}09` }}>
        <div style={{ fontWeight:900, fontSize:16, marginBottom:12, color:T.text }}>
          {editingBoardId ? "✏️ Edit Board" : "✏️ Create New Board"}
        </div>

        <input style={{ ...css.formInput, marginBottom:10 }} placeholder="Board name (e.g. Morning Routine, School Day…)" value={builderName} onChange={e=>setBuilderName(e.target.value)} />

        <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
          <div style={{ flex:1, minWidth:160 }}>
            <span style={css.label}>Color</span>
            <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
              {BOARD_COLORS.map(c => (
                <button key={c} onClick={()=>setBuilderColor(c)} style={{ width:30,height:30,borderRadius:"50%",background:c,border:builderColor===c?"3px solid #1A1A2E":"3px solid transparent",cursor:"pointer",outline:builderColor===c?"3px solid #fff":"none",outlineOffset:1,transition:"transform 0.1s",transform:builderColor===c?"scale(1.15)":"scale(1)" }} />
              ))}
            </div>
          </div>
          <div style={{ flex:1, minWidth:180 }}>
            <span style={css.label}>Board Icon</span>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {BOARD_EMOJIS.map(e => (
                <button key={e} onClick={()=>setBuilderEmoji(e)} style={{ fontSize:20,background:builderEmoji===e?`${builderColor}33`:"none",border:builderEmoji===e?`2px solid ${builderColor}`:"2px solid transparent",borderRadius:8,padding:"3px 5px",cursor:"pointer",transition:"transform 0.1s",transform:builderEmoji===e?"scale(1.2)":"scale(1)" }}>
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>

        <span style={css.label}>Grid Size</span>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {GRID_SIZES.map(gs => (
            <button key={gs.label} onClick={()=>setBuilderGridSize(gs)} style={{ padding:"6px 12px",border:`2px solid ${builderGridSize.label===gs.label?builderColor:T.border}`,borderRadius:10,background:builderGridSize.label===gs.label?`${builderColor}18`:T.bg,color:builderGridSize.label===gs.label?builderColor:T.text,fontWeight:800,fontSize:12,cursor:"pointer",fontFamily:"inherit" }}>
              {gs.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Two-Panel ── */}
      <div style={{ display:"flex", minHeight:380 }}>

        {/* LEFT: Grid Template */}
        <div style={{ flex:"0 0 55%", padding:12, borderRight:`1px solid ${T.border}` }}>
          <div style={{ fontSize:11,fontWeight:800,color:T.subtext,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10 }}>
            📐 Template Grid — drag symbols in
          </div>
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${builderGridSize.cols},1fr)`, gap:6 }}>
            {Array.from({ length: builderGridSize.cells }, (_, i) => {
              const sym = builderCells[i];
              const over = dragOverCell === i;
              return (
                <div key={i}
                  onDragOver={e=>handleDragOver(e,i)}
                  onDrop={e=>handleCellDrop(e,i)}
                  onDragLeave={()=>{}}
                  style={{
                    aspectRatio:"1", borderRadius:12, position:"relative",
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    border:over?`2px dashed ${builderColor}`:sym?`2px solid ${sym.color}66`:`2px dashed ${T.border}`,
                    background:over?`${builderColor}18`:sym?`${sym.color}15`:T.bg,
                    transition:"all 0.15s", cursor:sym?"grab":"default", minHeight:55,
                  }}
                >
                  {sym ? (
                    <>
                      <div draggable onDragStart={e=>handleCellDragStart(e,i)} onDragEnd={handleDragEnd}
                        style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:2,width:"100%",padding:4,cursor:"grab" }}>
                        <span style={{ fontSize:"min(30px,5vw)" }}>{sym.emoji}</span>
                        <span style={{ fontSize:"min(9px,1.6vw)",fontWeight:800,textAlign:"center",color:T.text,lineHeight:1.1,maxWidth:"88%",padding:"0 2px" }}>{sym.label}</span>
                      </div>
                      <button onClick={()=>removeFromCell(i)} style={{ position:"absolute",top:3,right:3,background:"#EF444499",border:"none",borderRadius:"50%",width:17,height:17,fontSize:9,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,lineHeight:1 }}>✕</button>
                    </>
                  ) : (
                    <span style={{ fontSize:20,opacity:0.18 }}>＋</span>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize:11,color:T.subtext,marginTop:10,textAlign:"center" }}>
            {Object.keys(builderCells).length}/{builderGridSize.cells} slots filled · drag icons from the right panel
          </div>
        </div>

        {/* RIGHT: Symbol Browser */}
        <div style={{ flex:1, padding:12, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ fontSize:11,fontWeight:800,color:T.subtext,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8 }}>
            🔎 Symbol Library
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:6,background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"5px 10px",marginBottom:8 }}>
            <span style={{ fontSize:12 }}>🔍</span>
            <input style={{ ...css.input,fontSize:12 }} placeholder="Search symbols…" value={builderSearch} onChange={e=>setBuilderSearch(e.target.value)} />
            {builderSearch && <button style={{ background:"none",border:"none",cursor:"pointer",fontSize:12,color:T.subtext }} onClick={()=>setBuilderSearch("")}>✕</button>}
          </div>
          {!builderSearch && (
            <div style={{ display:"flex",gap:4,overflowX:"auto",marginBottom:8,paddingBottom:2 }}>
              {CATEGORIES.map(cat=>(
                <button key={cat.id} onClick={()=>setBuilderCategory(cat.id)} style={{ flexShrink:0,padding:"4px 9px",borderRadius:20,border:"none",fontWeight:700,fontSize:10,cursor:"pointer",fontFamily:"inherit",background:builderCategory===cat.id?cat.color:T.bg,color:builderCategory===cat.id?"#1A1A2E":T.subtext }}>
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          )}
          <div style={{ display:"flex",flexWrap:"wrap",gap:6,overflowY:"auto",flex:1,alignContent:"flex-start" }}>
            {builderSymbols.map(sym => (
              <div key={sym.id} draggable onDragStart={()=>handleDragStart(sym)} onDragEnd={handleDragEnd}
                style={{ width:64,height:64,background:`${sym.color}22`,border:`2px solid ${sym.color}55`,borderRadius:12,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"grab",gap:2,userSelect:"none",transition:"transform 0.1s",flexShrink:0 }}>
                <span style={{ fontSize:24 }}>{sym.emoji}</span>
                <span style={{ fontSize:8,fontWeight:800,textAlign:"center",color:T.text,padding:"0 3px",lineHeight:1.1 }}>{sym.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Save Bar ── */}
      <div style={{ padding:"12px 16px",borderTop:`1px solid ${T.border}`,display:"flex",gap:10,alignItems:"center",background:T.panel }}>
        <div style={{ flex:1 }}>
          {saveSuccess
            ? <span style={{ fontSize:14,fontWeight:800,color:"#10B981",animation:"pop 0.3s ease" }}>✅ Board saved successfully!</span>
            : builderName.trim()
              ? <span style={{ fontSize:13,fontWeight:700,color:T.subtext }}>{builderEmoji} <strong style={{ color:T.text }}>{builderName}</strong></span>
              : <span style={{ fontSize:12,color:T.subtext }}>Enter a board name above to save</span>
          }
        </div>
        <button onClick={saveBoard} disabled={!builderName.trim()} style={{ background:builderName.trim()?`linear-gradient(135deg,${builderColor},${builderColor}bb)`:T.border,color:builderName.trim()?"#fff":T.subtext,border:"none",borderRadius:12,padding:"10px 22px",fontWeight:900,fontSize:14,cursor:builderName.trim()?"pointer":"default",fontFamily:"inherit",boxShadow:builderName.trim()?`0 4px 12px ${builderColor}44`:"none",transition:"all 0.2s" }}>
          💾 {editingBoardId ? "Update Board" : "Save Board"}
        </button>
      </div>
    </div>
  );
}
