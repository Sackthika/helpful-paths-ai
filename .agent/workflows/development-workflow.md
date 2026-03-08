---
description: Project Development Workflow for Hospital Navigation System
---

// turbo-all

## 🚀 Development Workflow

This document outlines the standard procedures for developing, testing, and managing data for the Hospital Navigation System.

### 1. Environment Setup
Before starting, ensure you have Node.js installed. Install dependencies for both the frontend and backend modules.

- **Frontend**:
  ```powershell
  cd helpful-paths-ai
  npm install
  ```
- **Backend**:
  ```powershell
  cd backend
  npm install
  ```

### 2. Running the Application
To run the full system, you need to start both services.

- **Start Backend (API & Database)**:
  ```powershell
  cd backend
  npm run dev
  ```
  *The backend manages the SQLite database for hospital records.*

- **Start Frontend (UI & Navigation)**:
  ```powershell
  cd helpful-paths-ai
  npm run dev
  ```
  *The frontend provides the interactive kiosk and AR navigation views.*

### 3. Data Management Workflow
The project uses a CSV-to-JSON pipeline for managing patient and department data.

1. **Update CSV**: Open `helpful-paths-ai/hospital_dataset.csv` and add or modify patient records.
2. **Run Import Script**: Transform the CSV data into the application's internal JSON format.
   ```powershell
   cd helpful-paths-ai
   npx tsx src/scripts/importDataset.ts
   ```
3. **Verify Data**: (Optional) Run the verification script to ensure data integrity.
   ```powershell
   cd helpful-paths-ai
   npx tsx src/scripts/verify_dataset.ts
   ```

### 4. Reporting & Export
- **Export to Excel**: Use the export utility in the application to download datasets.
- **Generate Print Report**: The system can generate a bilingual HTML report for printing.
  - *Trigger this through the UI components or by calling `printHospitalReport` from `src/lib/reportUtils.ts`.*

### 5. Multi-Language Support
When adding new features:
- Ensure all text labels have both English and Tamil translations.
- Refer to `src/pages/RoleSelection.tsx` for implementation patterns of bilingual UI components.

### 6. Testing
Run the test suite to ensure navigation logic and component rendering are working correctly.
```powershell
cd helpful-paths-ai
npm run test
```
