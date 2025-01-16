# // Use an official Node.js runtime as a parent image
FROM node:18-alpine

# // Set the working directory in the container
WORKDIR /app

# // Copy package.json and package-lock.json to the container's working directory
COPY package*.json ./

# // Install dependencies from package.json
RUN npm install

# // Copy the rest of the application code to the container
COPY . .

# // Expose the port the application will run on
EXPOSE 3000

# // Run the application
CMD [ "npm", "start" ]