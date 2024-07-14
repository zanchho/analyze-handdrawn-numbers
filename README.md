# Analyze Hand-Drawn Numbers

This project is designed to analyze and classify hand-drawn numbers using a neural network. It allows users to draw numbers on a canvas,
which are then processed and classified by a machine learning model trained on a dataset of hand-drawn digits.
The application is built with JavaScript, leveraging libraries such as `express` for the backend, `brain.js` for the neural network,
and `sharp` for image processing.

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Provide Trainingdata into the `ai/dataset/{expectedOutcome}/` and Testdata into the `ai/test/{expectedOutcome}/` folder.
4. Start the server with `npm start`.

### Usage

- Draw a number on the canvas provided in the web interface.
- Click "Submit" to send the drawing to the server for analysis.
- The server processes the image and returns the predicted digit.

## Directory Structure

- `index.js`: Entry point of the application, setting up the Express server and handling file uploads.
- `public/index.html`: Frontend interface for drawing and submitting numbers.
- `public/handleCanvas.js`: Handles canvas drawing and image submission.
- `ai/ImageClassifier.js`: Contains the logic for training the neural network and making predictions.
- `ai/datasets`: Training data for each digit (0-9) (not included in the repository).
- `ai/test`: Testing data for each digit (0-9) (not included in the repository).
- `uploads`: Directory for storing uploaded images.

## Technologies Used

- **Backend**: Express, Multer, Sharp, Brain.js
- **Frontend**: HTML, Canvas API

## Features

- **Drawing Interface**: Users can draw numbers on a canvas.
- **Image Upload**: Drawn images are uploaded and processed.
- **AI Prediction**: The neural network predicts the drawn digit.
- **Training**: The model can be trained locally on a dataset of hand-drawn numbers.

## Configuration

- The server listens on `http://127.0.0.1:3000/`.
- Training data uses the `datasets` directory.
- Neural network configuration is defined in `ImageClassifier.js`.
- Trainings learningrate and iterations are defined in the train function within `ImageClassifier.js`.

## Dependencies

```json
  "dependencies": {
    "body-parser": "^1.20.2",
    "brain.js": "^2.0.0-beta.23",
    "brainjs": "^0.7.4",
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "multer": "^1.4.5-lts.1",
    "nodemon": "^3.1.4",
    "sharp": "^0.33.4"
  }
```

**Note**: Training and test data are not included in the repository. You will need to provide your own datasets for training and testing the model. The datasets should be placed in the `ai/datasets` and `ai/test` directories. Train- and Testdata could be obtained by `dataset.zip` and `datatest.zip`, but they are not officially included in the repository. Also the `datatest.zip` is heavily reduced due to avoid any conflicts with copyright.

## Scripts

- `start`: Runs the server without using `nodemon`.
- `dev`: Runs the server using `nodemon` for development.

## Nodemon Configuration

- Watches for changes in `.js`, `.json`, and `.html` files.
- Ignores `ai/{dataset & test}/{digit}/*`, `node_modules`, and `uploads`.
- Sets `NODE_ENV` to `development`.
- Delays restart by 2500 milliseconds.

## Training and Test Data

The project is designed to work with a dataset of hand-drawn numbers, divided into training and test sets for each digit (0-9). Due to the size and nature of the dataset, it is not included in the repository. You will need to provide your own datasets in the specified directories (`ai/datasets` for training and `ai/test` for testing) to use the training functionality.

## License

Free to use and modify. Linking to this repository is not required.

## Reasons for Abandonment

The project was initially promising, but due to hardware limitations, the training process proved to be excessively time-consuming, making it
impractical to continue development on the current machine. Nonetheless, the Project provided valuable learning experiences and deeper insights
into machine learning and image processing.
It was my First time combining AI with image processing and my first Usage of the Sharp library. Using sharp is pretty straight forward,
which was a good thing. I learned a lot about how to use the library and how to process images.

## Screenshots

TODO add screens and explain
