# UI Components (Ocean Professional)

This folder contains reusable, accessible UI components styled with Tailwind v4 and aligned to the Ocean Professional theme.

Available components:
- Button (variants: primary, secondary, outline, ghost, destructive)
- Input (label, helper, error)
- Select (label, helper, error)
- Card (CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
- Badge
- Breadcrumbs
- Tabs (keyboard navigation, roving focus)
- Modal / Drawer (accessible dialog semantics)
- Table (empty state and pagination)
- ToastProvider, useToast, Toaster (global toast system)

Import via the barrel file:
import { Button, Card, useToast } from "@/components/ui";

Global Toast:
AppShell wraps the app in <ToastProvider/> so you can call:
const { show } = useToast();
show({ title: "Saved", description: "Changes saved successfully", variant: "success" });
