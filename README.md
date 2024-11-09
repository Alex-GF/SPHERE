# 🌐 SPHERE - SaaS Pricing Holistic Evaluation and Regulation Environment

## 🚀 Installation Guide

To set up and run this project, follow these steps:

#### ⚙️ Prerequisites
Ensure you have **Deno 2.0** installed, as it is the package manager of the project. If you haven't installed Deno, please refer to the official [Deno installation guide](https://deno.land/manual/getting_started/installation) before proceeding.

#### 📥 Steps to Install

1. **Clone the Repository**  
   Start by cloning the project repository to your local machine:
   ```bash
   git clone https://github.com/Alex-GF/SPHERE.git
   ```
   
2. **Navigate to the Project Directory**  
   Change into the project folder:
   ```bash
   cd SPHERE
   ```

3. **📝 Configure Environment Variables**  
   Create a `.env` file in the root directory of the project, using the provided `.env.example` as a reference. The `.env.example` file should look like this:

   ```plaintext
   DATABASE_TECHNOLOGY=mockDB|sequelize
   SERVER_PORT=1234
   ```

   Currently, the only supported database option is `mockDB`. Here’s an example `.env` configuration:

   ```plaintext
   DATABASE_TECHNOLOGY=mockDB
   SERVER_PORT=8080
   ```

4. **🔧 Install Dependencies and Run the Project**  
   Once the `.env` file is set up, run the following commands in your terminal to install dependencies and start the development server:

   ```bash
   deno install
   deno task dev
   ```

   🎉 After running these commands, the project should be up and running!