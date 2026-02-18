import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import UserForm from "./UserForm";
import UsersTable from "./UsersTable";

interface EditingUser {
  id: string;
  name: string;
  email: string;
}

type DialogState = { mode: "create" } | { mode: "edit"; user: EditingUser } | null;

export default function UsersPage() {
  const [dialog, setDialog] = useState<DialogState>(null);

  const close = () => setDialog(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={() => setDialog({ mode: "create" })}>
          <Plus className="mr-2 h-4 w-4" />
          New User
        </Button>
      </div>
      <UsersTable onEdit={(user) => setDialog({ mode: "edit", user })} />
      <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) close(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog?.mode === "edit" ? "Edit User" : "Create User"}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            key={dialog?.mode === "edit" ? dialog.user.id : "create"}
            user={dialog?.mode === "edit" ? dialog.user : undefined}
            onSuccess={close}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
