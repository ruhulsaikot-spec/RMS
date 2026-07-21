import FoodExpenseTable from "./FoodExpenseTable";

type FoodFormProps = {
  formData: any;
  setFormData: any;
};

export default function FoodForm({
  formData,
  setFormData,
}: FoodFormProps) {

  return (
    <FoodExpenseTable
      items={formData.foodItems}
      setItems={(items: any) =>
        setFormData({
          ...formData,
          foodItems: items,
        })
      }
    />
  );

}