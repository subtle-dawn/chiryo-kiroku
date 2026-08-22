import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { BackupPage } from "../pages/BackupPage";
import { ConsultationNoteEditPage } from "../pages/ConsultationNoteEditPage";
import { ConditionEditPage } from "../pages/ConditionEditPage";
import { ConditionPage } from "../pages/ConditionPage";
import { HospitalListPage } from "../pages/HospitalListPage";
import { HomePage } from "../pages/HomePage";
import { RecordEditPage } from "../pages/RecordEditPage";
import { SettingsPage } from "../pages/SettingsPage";

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/condition/new" element={<ConditionEditPage />} />
        <Route path="/condition/:conditionId" element={<ConditionPage />} />
        <Route path="/condition/:conditionId/edit" element={<ConditionEditPage />} />
        <Route path="/condition/:conditionId/hospitals" element={<HospitalListPage />} />
        <Route path="/condition/:conditionId/consultation-note/edit" element={<ConsultationNoteEditPage />} />
        <Route path="/condition/:conditionId/record/new" element={<RecordEditPage />} />
        <Route path="/condition/:conditionId/record/:recordId/edit" element={<RecordEditPage />} />
        <Route path="/backup" element={<BackupPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
