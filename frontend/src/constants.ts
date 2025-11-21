import { DocumentData, Group, Message, HistoryItem, ChatMember } from './types';

export const MOCK_DOCS: DocumentData[] = [
  {
    id: 'doc-fanuc',
    title: 'FANUC Robot Series R-30iB Mate / Mate Plus Maintenance Manual',
    ownerId: 'user-1',
    ownerName: 'Admin',
    isPublic: true,
    uploadDate: '2023-11-22',
    fileSize: '18.5 MB',
    type: 'MAINTENANCE',
    summary: 'Comprehensive maintenance manual for FANUC R-30iB Mate/Mate Plus controllers. Covers safety protocols, troubleshooting steps, error codes (SRVO), and component replacement procedures.',
    content: [
      "FANUC Robot series\nR-30iB Mate/R-30iB Mate Plus\nCONTROLLER\nMAINTENANCE MANUAL\n\nMARETIBCN01121E REV. G\n©2017 FANUC America Corporation\nAll Rights Reserved.\n\nThis publication contains proprietary information of FANUC America Corporation furnished for customer use only. No other uses are authorized without the express written permission of FANUC America Corporation.",
      "SAFETY\n\nFANUC America Corporation is not and does not represent itself as an expert in safety systems, safety equipment, or the specific safety aspects of your company and/or its work force. It is the responsibility of the owner, employer, or user to take all necessary steps to guarantee the safety of all personnel in the workplace.\n\nCONSIDERING SAFETY FOR YOUR ROBOT INSTALLATION\nSafety is essential whenever robots are used. Keep in mind the following factors with regard to safety:\n- The safety of people and equipment\n- Use of safety enhancing devices\n- Techniques for safe teaching and manual operation of the robot(s)\n- Techniques for safe automatic operation of the robot(s)\n- Regular scheduled inspection of the robot and workcell",
      "3. TROUBLESHOOTING\n\n3.1 POWER CANNOT BE TURNED ON\n\nInspection and action\n(Inspection 1) Check that the circuit breaker is on and has not tripped.\n(Action)\na) If circuit breaker is OFF. Turn on the circuit breaker.\nb) If the circuit breaker has tripped, find the cause by referencing the total connection diagram presented in the appendix.\n\n3.1.1 When the Teach Pendant Cannot be Powered on\n(Inspection 1) Confirm that fuse (FUSE3) on the emergency stop board is not blown. When it is blown, the LED on the emergency stop board lights in red. When fuse (FUSE3) is blown, carry out action 1 and replace the fuse.\n(Action 1)\n(a) Check the cable of the teach pendant for failure and replace it as necessary.\n(b) Check the teach pendant for failure and replace it as necessary.\n(c) Replace the emergency stop board.",
      "3.5 TROUBLESHOOTING USING THE ALARM CODE\n\nSRVO-001 Operator panel E-stop\n(Explanation) The emergency stop button on the operator's panel is pressed.\n(Action 1) Release the emergency stop button pressed on the operator's panel.\n(Action 2) Check the wires connecting between the emergency stop button and the emergency stop board (CRT30) for continuity. If an open wire is found, replace the entire harness.\n(Action 3) Check the wires connecting between the teach pendant and the emergency stop board (CRS36) for continuity. If an open wire is found, replace the entire harness.\n(Action 4) With the emergency stop in the released position, check for continuity across the terminals of the switch. If continuity is not found, the emergency stop button is broken. Replace the emergency stop button or the operator's panel.\n(Action 5) Replace the teach pendant.\n(Action 6) Replace the emergency stop board.\n(Action 7) Replace the main board.\n\nNOTE: If SRVO-001 is issued together with SRVO-213, a fuse may have blown. Take the same actions as for SRVO-213.",
      "3.7.2 Troubleshooting by LEDs on the 6-Axis Servo Amplifier\n\nThe 6-Axis servo amplifier has alarm LEDs. Troubleshoot the alarm indicated by the LEDs, referring also to the alarm indication on the teach pendant.\n\nLED Color Description\n\nV4 Red: Lights when the DCLINK circuit inside the servo amplifier is charged to reach a specific voltage.\nSVALM Red: Lights when the servo amplifier detects an alarm.\nSVEMG Red: Lights when an emergency stop signal is input to the servo amplifier.\nDRDY Green: Lights when the servo amplifier is ready to drive the servo motor.\nOPEN Green: Lights when the communication between the servo amplifier and the main board is normal.\nP5V Green: Lights when the power supply circuit inside the servo amplifier outputs a voltage of +5 V normally.\nP3.3V Green: Lights when the power supply circuit inside the servo amplifier outputs a voltage of +3.3 V normally."
    ]
  },
  {
    id: 'doc-microwave',
    title: 'Commercial Microwave Oven INSTRUCTION MANUAL - Model 1025F0A',
    ownerId: 'user-1',
    ownerName: 'Current User',
    isPublic: true,
    uploadDate: '2023-12-01',
    fileSize: '2.1 MB',
    type: 'MANUAL',
    summary: 'Instruction manual for Midea Commercial Microwave Oven Model 1025F0A. Includes safety instructions, installation, operation, and maintenance.',
    content: [
      "Commercial Microwave Oven\nINSTRUCTION MANUAL\nModel : 1025F0A\n\nRead these instructions carefully before using your microwave oven, and keep it for reference.\nIf you follow the instructions, your oven will provide you with many years of dependable service.\nREAD CAREFULLY",
      "CONTENTS\n\nIMPORTANT SAFEGUARDS\nPRECAUTIONS .......................................................... 3\nIMPORTANT SAFETY INSTRUCTIONS ........................ 3\nGROUNDING INSTRUCTIONS ................................... 5\nRADIO INTERFERENCE ........................................... 6\nSAFETY .................................................................... 6\n\nBEFORE THE FIRST USE\nUTENSILS ................................................................ 7\n\nPARTS & FEATURES\nNAMES OF PARTS & ACCESSORIES ......................... 9\nINSTALLATION ....................................................... 10\nCONTROL PANEL .................................................... 11\n\nOPERATION INSTRUCTION\nFUNCTION INSTRUCTION ...................................... 12\n\nCLEANING & MAINTENANCE\nCLEANING INSTRUCTION ...................................... 13\nMAINTENANCE ...................................................... 14\n\nSPECIFICATIONS\nModel: 1025F0A\nRated Voltage: 120V~60Hz\nRated Input Power: 1500 W\nRated Output Power: 1000 W\nOven Capacity: 0.9 Cu.ft.\nExternal dimensions: 20.1 x 17.0 x 12.3 inch\nNet Weight: Approx. 32.4 Lbs",
      "PRECAUTIONS TO AVOID POSSIBLE EXPOSURE TO EXCESSIVE MICROWAVE ENERGY\n\n(a) Do not attempt to operate this oven with the door open since open-door operation can result in harmful exposure to microwave energy. It is important not to defeat or tamper with the safety interlocks.\n(b) Do not place any object between the oven front face and the door or allows soil or cleaner residue to accumulate on sealing surfaces.\n(c) Do not operate the oven if it is damaged. It is particularly important that the oven door close properly and that there is no damage to the:\n(1) DOOR (bent)\n(2) HINGES AND LATCHES (broken or loosened)\n(3) DOOR SEALS AND SEALING SURFACES\n(d) The oven should not be adjusted or repaired by anyone except properly qualified service personnel.\n\nIMPORTANT SAFETY INSTRUCTIONS\n\nWARNING - To reduce the risk of burns, electric shock, fire, injury to persons or exposure to excessive microwave energy:\n1. Read all instructions before using the appliance.\n2. Read and follow the specific: \"PRECAUTIONS TO AVOID POSSIBLE EXPOSURE TO EXCESSIVE MICROWAVE ENERGY\" found on page 3.",
      "CONTROL PANEL\n\n(1) Use the knob to select the cooking time.\n\nMENU GUIDE\nCheese 30sec\nBread 15sec\nHotdog 45sec\n\nTIMER\n0..15..30..45..1..2..3..4..5\n\nHamburger 1:30-2:30min\nPopcorn 2min\nCoffee 1-2min\n\nTo operate:\n1. Rotate dial to set time.\n2. Open door to interrupt cooking.",
      "Cleaning Instructions\n\nAlways keep the oven clean\n\n1. Cleaning the glass viewing window, the inner door panel and oven front face. For best performance and to maintain the high degree of safety, the inner door panel and oven front face should be free of food or grease build-up. Wipe these parts with a towel damp with mild detergent, rinse and sanitize. Never use abrasive powders or pads.\n\n2. Cleaning the control panel and plastic parts.\nDo not apply a detergent or an alkaline liquid spray to the control panel and plastic parts, as this may cause damage to these parts. Use a damp cloth (not a soaked cloth) to clean these parts.\n\n3. Cleaning the oven interior\nAfter use, be sure to clean up spilled liquids, spattered oil and food debris as quickly as possible. If the oven is used when dirty, efficiency drops and the dirt gets stuck on the oven surface and may cause decreased performance. This can also cause arcing. Always remember to inspect the ceiling of the oven cavity."
    ]
  },
  {
    id: 'doc-3',
    title: 'Internal Security Protocols v9',
    ownerId: 'user-1',
    ownerName: 'Admin',
    isPublic: false,
    uploadDate: '2023-11-10',
    fileSize: '4.5 MB',
    type: 'CONFIDENTIAL',
    summary: 'Restricted access security protocols for site B. Strictly for authorized personnel only.',
    content: ["CONFIDENTIAL: Level 5 Clearance Required. Access Denied."]
  }
];

export const MOCK_GROUPS: Group[] = [
  {
    id: 'g-fanuc',
    name: 'FANUC R-30iB Maintenance',
    description: 'Discussion for troubleshooting and maintaining R-30iB controllers.',
    members: 156,
    active: true,
    relatedDocId: 'doc-fanuc',
    relatedDocTitle: 'FANUC Robot Series R-30iB Mate Maintenance Manual',
    type: 'public',
    tags: ['robotics', 'maintenance', 'fanuc']
  },
  { 
    id: 'g-micro', 
    name: 'Commercial Kitchen Ops', 
    description: 'Best practices for maintaining commercial kitchen equipment.', 
    members: 42, 
    active: true,
    relatedDocId: 'doc-microwave',
    relatedDocTitle: 'Commercial Microwave Oven INSTRUCTION MANUAL',
    type: 'public',
    tags: ['kitchen', 'appliance', 'safety']
  },
  { 
    id: 'g-security', 
    name: 'Site B Security Review', 
    description: 'Confidential review of v9 protocols.', 
    members: 3, 
    active: true, 
    relatedDocId: 'doc-3',
    relatedDocTitle: 'Internal Security Protocols v9',
    type: 'private',
    orgName: 'Security Ops',
    tags: ['security', 'internal']
  }
];

export const MOCK_CHATS: Record<string, Message[]> = {
  'doc-fanuc': [
    { id: 'm1', sender: 'ai', text: 'Hello! I have indexed the FANUC R-30iB Maintenance Manual. You can ask about error codes (like SRVO-001), fuse replacements, or safety protocols.' },
    { id: 'm2', sender: 'user', text: 'What does the SRVO-001 alarm mean?' },
    { id: 'm3', sender: 'ai', text: 'SRVO-001 is the "Operator panel E-stop" alarm. It means the emergency stop button on the operator panel has been pressed. You should release the button and check continuity of the wires connecting to the emergency stop board (CRT30).', referenceId: 4 }
  ],
  'doc-microwave': [
    { id: 'm1', sender: 'ai', text: 'Hello! I have analyzed the Midea Commercial Microwave Manual. Ask me about installation clearance, cleaning instructions, or error troubleshooting.' },
    { id: 'm2', sender: 'user', text: 'Can I use metal pans?' },
    { id: 'm3', sender: 'ai', text: 'No, you should avoid using aluminum trays or metal utensils as they may cause arcing. Aluminum foil can be used for shielding only if it is at least 1 inch away from oven walls.', referenceId: 3 }
  ]
};

export const MOCK_HISTORY: HistoryItem[] = [
  { id: 'h0', query: 'SRVO-001 error code', docTitle: 'FANUC R-30iB Maintenance', date: '10 mins ago', docId: 'doc-fanuc' },
  { id: 'h1', query: 'cleaning instructions', docTitle: 'Commercial Microwave Manual', date: '2 hours ago', docId: 'doc-microwave' },
  { id: 'h2', query: 'fuse replacement', docTitle: 'FANUC R-30iB Maintenance', date: '1 day ago', docId: 'doc-fanuc' },
];

export const MOCK_CHAT_MEMBERS: ChatMember[] = [
  { id: 'u1', name: 'Sarah Connors', role: 'Safety Officer', status: 'online' },
  { id: 'u2', name: 'Mike Ross', role: 'Lead Engineer', status: 'away' },
  { id: 'u3', name: 'Jessica Pearson', role: 'Auditor', status: 'online' },
];