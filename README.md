# TinnitOff

A comprehensive tinnitus (ringing in the ears) management web application designed to support users in habituating to and managing tinnitus symptoms through sound therapy, daily tracking, AI-assisted guidance, and community support.

## ⚠️ Important Disclaimer

**This application is not a substitute for professional medical advice.** Tinnitus can be a symptom of underlying health conditions. Always consult with an otolaryngologist (ear specialist) or qualified healthcare professional before starting any treatment. This app should be used as a complementary tool alongside professional medical consultation.

## Features

- **Frequency Matching**: Identify your tinnitus frequency through audiometry (pure tone, low-frequency motor, or noise)
- **Daily Tracking**: Log tinnitus levels, triggers, and moods to monitor progress and maintain streaks
- **Sound Therapy Library**: Access a collection of therapeutic sounds for habituation
- **Spatial Audio**: Immersive 3D sound therapy using Web Audio API and Three.js
- **AI Chat Support**: Conversational AI for tinnitus-related advice and emotional support
- **Facial Tension Monitoring**: Detect stress indicators using face-api.js and suggest relaxation exercises
- **Digital Twin**: AI avatar providing personalized recommendations based on your data
- **Breathing Guide**: Guided breathing exercises (e.g., 4-7-8 technique)
- **Custom Noise Generation**: Create personalized noise for therapy
- **Educational Content**: Learn about tinnitus management and coping strategies
- **Medical Profile & Reports**: Maintain profiles and generate PDF reports for doctors
- **Community Features**: Connect with others experiencing tinnitus
- **Global Map Visualization**: Interactive map showing tinnitus prevalence (using react-simple-maps and d3-geo)
- **Multilingual Support**: Available in English and Spanish
- **Dark Mode**: User-friendly interface with theme switching

## Tech Stack

- **Frontend**: React with Vite
- **3D Graphics**: React Three Fiber, Three.js
- **Audio Processing**: Web Audio API
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Backend**: Firebase (Authentication, Firestore)
- **AI Services**: Azure AI
- **Face Detection**: face-api.js
- **Maps**: react-simple-maps, d3-geo

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Firebase project setup
- Azure account for AI services (optional, for full functionality)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tinnitus-app.git
   cd tinnitus-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication and Firestore
   - Copy your Firebase config to `src/firebase.js`

4. Configure Azure (optional):
   - Set up Azure AI services
   - Add API keys to your environment variables

## Running the App

### Development
```bash
npm run dev
```
This starts the development server on `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## Usage

1. **Onboarding**: Complete the initial setup and legal disclaimer
2. **Frequency Matching**: Use the audiometry tool to identify your tinnitus frequency
3. **Daily Logging**: Track your symptoms daily to build habituation streaks
4. **Sound Therapy**: Explore and use therapeutic sounds from the library
5. **AI Support**: Chat with the AI assistant for guidance and support
6. **Progress Monitoring**: View charts and reports of your progress
7. **Community**: Connect with other users (when implemented)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

If you have questions or need support, please consult a healthcare professional first. For technical issues with the app, create an issue in this repository.

---

*Remember: This app is a tool for self-management and should not replace professional medical care.*</content>
<parameter name="filePath">C:\Users\Lenovo\Desktop\tinnitus-app\README.md