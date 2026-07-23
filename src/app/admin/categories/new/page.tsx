import { AdminPageHeader } from "@/components/admin/admin-ui";
import { CategoryForm } from "@/components/admin/category-form";

export default function NewCategoryPage() {
  return (
    <div>
      <AdminPageHeader title="Add Category" description="Create a new product category" />
      <CategoryForm />
    </div>
  );
}
