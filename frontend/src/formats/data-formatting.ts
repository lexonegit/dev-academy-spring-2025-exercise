const time = (value) => {
  return value.split("T")[1].slice(0, 5);
};

const production = (value) => {
  return Math.round(value);
};

const consumption = (value) => {
  return Math.round(value / 1000);
};

const price = (value) => {
  return (value).toFixed(2);
};


const hours = (value) => {
  return `${value} hrs`;
};

export default { time, production, consumption, price, hours };
