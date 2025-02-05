interface PageHeaderProps {
  title: string;
  actions?: { label: string; onClick: () => void; icon?: JSX.Element }[];
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, actions = [] }) => (
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-bold text-gray-700">{title}</h2>
    <div className="flex space-x-2">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={action.onClick}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          {action.icon && <span className="mr-2">{action.icon}</span>}
          {action.label}
        </button>
      ))}
    </div>
  </div>
);

export default PageHeader;
