# Atlas Vision Tool

An advanced cinematography tool for format comparison and anamorphic desqueeze simulation, built for Atlas Lens Co.

## Features

- **Format Comparison**: Visualize and compare different camera sensor modes side-by-side.
- **Anamorphic Simulation**: Real-time desqueezed output simulation for Atlas anamorphic lenses.
- **Image Circle Visualization**: Check for potential vignetting by comparing lens image circles against sensor dimensions.
- **Delivery Area Overlays**: Preview common delivery aspect ratios (2.39:1, 1.85:1, etc.) on top of captured formats.
- **Exportable Reports**: Generate and save technical comparison reports as PNG images or PDF documents.

## Live Demo

View the live application here: [https://humanmint.github.io/atlas-vision](https://humanmint.github.io/atlas-vision)

## Tech Stack

- **React**: Frontend framework.
- **html2canvas**: For generating image exports of the comparison tool.
- **jsPDF**: For PDF report generation.
- **CSS3 Animations**: Smooth transitions for format and lens changes.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16.x or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/HumanMint/atlas-vision.git
   cd atlas-vision
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

#### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

#### `npm run deploy`

Builds the project and deploys it to GitHub Pages.

## License

Internal Tool - Atlas Lens Co. Technical specifications for visualization only.