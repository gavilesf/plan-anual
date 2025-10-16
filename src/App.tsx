import React, { useEffect } from "react";
import "./App.css";
import Logo from "./assets/logo.svg";


function App() {
  /**/
  function getPlan() {
    let temp = loadPlan();
    if (temp.length > 0) {
      return temp;
    }

    let data: any[] = s3Data;
    const ordered = data.sort(
      (a: { id: string }, b: { id: string }) => parseInt(a.id) - parseInt(b.id)
    );
    savePlan(ordered);
    return ordered;
  }

  function savePlan(plan: any) {
    localStorage.setItem("plan", JSON.stringify(plan));
  }

  function loadPlan() {
    const plan = localStorage.getItem("plan");
    if (plan) {
      return JSON.parse(plan);
    }
    return [];
  }
  /**/
  const [s3Data, setS3Data] = React.useState<any[]>([]);
  const [selectedWeekNumber, setSelectedWeekNumber] = React.useState<
    number | null
  >(null);
  const [showingWeekNumber, setShowingWeekNumber] = React.useState<
    number | null
  >(null);
  const [plan, setPlan] = React.useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogText, setDialogText] = React.useState("");
  const [weekItems, setWeekItems] = React.useState<any[]>([]);

  useEffect(() => {
    const fetchedPlan = getPlan();
    setPlan(fetchedPlan);
  }, [s3Data]);

  React.useEffect(() => {
    let localP = loadPlan();

    if (localP.length > 0) {
      setPlan(localP);
      return;
    }

    fetch(
      "https://gaf7012-public-ro.s3.us-east-2.amazonaws.com/main_plan_minified.js"
    )
      .then((response) => response.json())
      .then((jsonData) => {
        setS3Data(jsonData);
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  function onButtonClick(value: string) {
    if (selectedWeekNumber === null) {
      setDialogText("Número de semana no válido.");
      setDialogOpen(true);
      setShowingWeekNumber(null);
      return;
    }

    if (selectedWeekNumber < 1 || selectedWeekNumber > 53) {
      setDialogText("El número debe estar entre 1 y 53.");
      setDialogOpen(true);
      setShowingWeekNumber(null);
      return;
    }
    if (
      selectedWeekNumber !== null &&
      plan.length > 0 &&
      selectedWeekNumber >= 1 &&
      selectedWeekNumber <= 53
    ) {
      const startIndex = (selectedWeekNumber - 1) * 7;
      const endIndex = startIndex + 7;
      const items = plan.slice(startIndex, endIndex);
      setWeekItems(items);
      setShowingWeekNumber(selectedWeekNumber);
    } else {
      setWeekItems([]);
      setShowingWeekNumber(null);
    }
  }

  function onHover() {}

  function onInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (event.target.value === "") {
      setSelectedWeekNumber(null);
      return;
    }

    setSelectedWeekNumber(parseInt(event.target.value));
  }

  return (
    <>
      <AppHeader />
      <div className="bg-violet-50 min-h-screen p-4">
        <h4 className="text-lg sm:text-sm md:text-base lg:text-lg xl:text-xl pt-2.5 text-violet-900 text-center"></h4>
        <div className="flex justify-center items-center mt-1.5">
          <WeekInput onInputChange={onInputChange} />
          &nbsp;&nbsp;
          <TabButton onButtonClick={onButtonClick} onHover={onHover}>
            Ver Semana
          </TabButton>
          <Dialog
            isOpen={dialogOpen}
            onClose={() => {
              setDialogOpen(false);
            }}
            text={dialogText}
          />
        </div>
        <div>
          {showingWeekNumber !== null && (
            <h2 className="text-center text-violet-900 text-xl sm:text-lg md:text-xl lg:text-2xl xl:text-2xl font-semibold mt-4">
              Semana {showingWeekNumber}
            </h2>
          )}
        </div>
        <WeekTable
          weekItems={weekItems}
          visible={selectedWeekNumber !== null}
        />
      </div>
      <Footer />
    </>
  );
}

interface ChildProps {
  onButtonClick: (value: string) => void;
  children: React.ReactNode;
  onHover?: () => void;
}

const TabButton: React.FC<ChildProps> = ({
  children,
  onButtonClick,
  onHover,
}) => {
  return (
    <button
      className="bg-violet-900/90 text-white py-2 px-4 rounded hover:bg-violet-700/80 focus:ring-4 focus:ring-violet-300 focus:outline-none text-lg sm:text-sm md:text-base lg:text-lg xl:text-xl"
      onClick={() => onButtonClick("Button was clicked!")}
      onMouseOver={onHover}
    >
      {children}
    </button>
  );
};

function WeekInput({
  onInputChange,
}: {
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type="number"
      className="border max-w-2xl border-gray-300 rounded py-2 px-4 focus:outline-none text-right text-lg sm:text-sm md:text-base lg:text-lg xl:text-xl"
      onChange={onInputChange}
      placeholder="Número de semana"
    />
  );
}

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;

  text: string;
}

const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, text }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>
        <h2 className="text-lg font-bold mb-4 text-violet-900">{text}</h2>

        <button
          type="button"
          className="w-full px-4 py-2 bg-violet-600 text-white rounded-lg"
          onClick={onClose}
        >
          Aceptar
        </button>
      </div>
    </div>
  );
};

const AppHeader: React.FC = () => (
  <nav className="relative flex w-full flex-wrap items-center justify-between bg-gray-300 py-2 shadow-dark-mild dark:bg-neutral-700 lg:py-4">
    <div className="flex w-full flex-wrap items-center justify-between px-3">
      <div>
        <a className="mx-2 my-1 flex items-center lg:mb-0 lg:mt-0" href="#">
          <img src={Logo} style={{ height: 70 }} loading="lazy" />
          <span className="text-violet-900 font-bold text-lg sm:text-sm md:text-base lg:text-lg xl:text-xl">
            Casa De Dios Ags. Méx.
          </span>
        </a>
      </div>
    </div>
  </nav>
);

const WeekTable: React.FC<{ weekItems: any[]; visible: boolean }> = ({
  weekItems,
}) => {
  const weekDays = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];
  if (weekItems.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-4">
        No hay lecturas para esta semana.
      </p>
    );
  }

  return (
    <table className="min-w-full bg-white border border-gray-300 mt-4">
      <thead>
        <tr className="hover:bg-violet-200">
          <th className="py-2 px-4 border-b border-gray-300 bg-violet-100 text-violet-950 text-center">
            Día{" "}
          </th>
          <th className="py-2 px-4 border-b border-gray-300 bg-violet-100 text-violet-950 text-center">
            Lectura{" "}
          </th>
        </tr>
      </thead>
      <tbody>
        {weekItems.map((item, index) => (
          <tr
            key={item.id}
            className={
              index % 2 === 0
                ? "hover:bg-violet-50 text-center text-sm text-violet-900"
                : "bg-gray-200 hover:bg-violet-50 text-center text-sm text-violet-900"
            }
          >
            <td className="py-2 px-4 border-b border-gray-300">
              {weekDays[index]}
            </td>
            <td className="py-2 px-4 border-b border-gray-300">
              {item.day_lecture}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const Footer = () => {
  return (
    <footer className="footer footer-center bg-violet-900/90 px-2 py-3">
      <aside>
        <p className="text-white text-center">
          Copyright © {new Date().getFullYear()} Lectura Bíblica Plan Anual.
        </p>
      </aside>
    </footer>
  );
};

export default App;
