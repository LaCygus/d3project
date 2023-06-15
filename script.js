function fianlproject() {
    let filePath = "pollution.csv";
    question0(filePath);
}

let question0 = function(filePath) {
    // preprocess data
    d3.csv(filePath).then(function(data) {
        const parseDate = d3.timeParse("%Y-%m-%d"); // Adjust the date format based on your data
        data.forEach(d => {
            d["State Code"] = +d["State Code"]; // Convert to a numeric value
            d["CountyCode"] = +d["CountyCode"]; // Convert to a numeric value (corrected property name)
            d["Site Num"] = +d["Site Num"]; // Convert to a numeric value
            d.Address = d.Address;
            d.State = d.State;
            d.County = d.County;
            d.City = d.City;
            d["Date Local"] = parseDate(d["Date Local"]); // Parse the date using the defined format
            d["NO2 Units"] = d["NO2 Units"];
            d["NO2 Mean"] = +d["NO2 Mean"]; // Convert to a numeric value
            d["NO2 1st Max Value"] = +d["NO2 1st Max Value"]; // Convert to a numeric value
            d["NO2 1st Max Hour"] = +d["NO2 1st Max Hour"]; // Convert to a numeric value
            d["NO2 AQI"] = +d["NO2 AQI"]; // Convert to a numeric value
            d["O3 Units"] = d["O3 Units"];
            d["O3 Mean"] = +d["O3 Mean"]; // Convert to a numeric value
            d["O3 1st Max Value"] = +d["O3 1st Max Value"]; // Convert to a numeric value
            d["O3 1st Max Hour"] = +d["O3 1st Max Hour"]; // Convert to a numeric value
            d["O3 AQI"] = +d["O3 AQI"]; // Convert to a numeric value
            d["SO2 Units"] = d["SO2 Units"];
            d["SO2 Mean"] = +d["SO2 Mean"]; // Convert to a numeric value
            d["SO2 1st Max Value"] = +d["SO2 1st Max Value"]; // Convert to a numeric value
            d["SO2 1st Max Hour"] = +d["SO2 1st Max Hour"]; // Convert to a numeric value
            d["SO2 AQI"] = +d["SO2 AQI"]; // Convert to a numeric value
            d["CO Units"] = d["CO Units"];
            d["CO Mean"] = +d["CO Mean"]; // Convert to a numeric value
            d["CO 1st Max Value"] = +d["CO 1st Max Value"]; // Convert to a numeric value
            d["CO 1st Max Hour"] = +d["CO 1st Max Hour"]; // Convert to a numeric value
            d["CO AQI"] = +d["CO AQI"]; // Convert to a numeric value
        });
        question1(data);
        question2(data);
        question3(data); 
        question4(data);
    });
}

let question1 = function (data) {
  // Group the data by year
  const filteredData = data.map((d) => ({
    year: String(d["Date Local"].getFullYear()), // Convert year to string for ordinal scale
    no2: d["NO2 Mean"] * 10, // Adjusted unit (e.g., ppb)
    o3: d["O3 Mean"] * 10000, // Adjusted unit (e.g., ppb)
    so2: d["SO2 Mean"] * 100, // Adjusted unit (e.g., ppb)
    co: d["CO Mean"] * 1000, // Adjusted unit (e.g., ppb)
  }));

  // Group the data by year and calculate mean values
  const groupedData = d3.groups(filteredData, (d) => d.year).map(
    ([year, values]) => ({
      year: year,
      no2Mean: d3.mean(values, (d) => d.no2),
      o3Mean: d3.mean(values, (d) => d.o3),
      so2Mean: d3.mean(values, (d) => d.so2),
      coMean: d3.mean(values, (d) => d.co),
    })
  );

  // Set up the dimensions and margins of the plot
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Create an SVG element
  // Question 1
  const svg = d3
    .select("#q1_plot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3
    .scaleBand() // Use ordinal scale for discrete years
    .domain(groupedData.map((d) => d.year))
    .range([0, width])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(groupedData, (d) =>
        d3.max([d.no2Mean, d.o3Mean, d.so2Mean, d.coMean])
      ),
    ])
    .range([height, 0]);

  // Create line generators for each pollutant
  const lineGenerator = d3
    .line()
    .x((d) => xScale(d.year) + xScale.bandwidth() / 2)
    .y((d) => yScale(d.value))
    .curve(d3.curveMonotoneX);

  // Create colors for different pollutants
  const colorScale = d3
    .scaleOrdinal()
    .domain(["NO2", "O3", "SO2", "CO"])
    .range(["red", "green", "blue", "orange"]);

  // Plot lines for each pollutant
  const pollutants = [
    { name: "NO2", values: groupedData.map((d) => ({ year: d.year, value: d.no2Mean })) },
    { name: "O3", values: groupedData.map((d) => ({ year: d.year, value: d.o3Mean })) },
    { name: "SO2", values: groupedData.map((d) => ({ year: d.year, value: d.so2Mean })) },
    { name: "CO", values: groupedData.map((d) => ({ year: d.year, value: d.coMean })) },
  ];

  const path = svg
    .selectAll(".line")
    .data(pollutants)
    .enter()
    .append("path")
    .attr("class", "line")
    .attr("d", (d) => lineGenerator(d.values))
    .attr("fill", "none")
    .attr("stroke", (d) => colorScale(d.name))
    .attr("stroke-width", 2)
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut);

  // Add data points for each pollutant
  pollutants.forEach((pollutant) => {
    svg
      .selectAll(`.${pollutant.name}`)
      .data(groupedData)
      .enter()
      .append("circle")
      .attr("class", `${pollutant.name} dot`)
      .attr("cx", (d) => xScale(d.year) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScale(d[pollutant.name.toLowerCase() + "Mean"]))
      .attr("r", 4)
      .attr("fill", colorScale(pollutant.name));
  });

  // Add x-axis to the scatter plot
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(xScale));

  // Add y-axis to the scatter plot
  svg.append("g").attr("class", "y-axis").call(d3.axisLeft(yScale));

  // Add labels, title, and legend
  // X-axis label
  svg
    .append("text")
    .attr("class", "x-label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .style("text-anchor", "middle")
    .text("Year");

  // Y-axis label
  svg
    .append("text")
    .attr("class", "y-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle")
    .text("Mean Pollution Level");

  // Title
  svg
    .append("text")
    .attr("class", "title")
    .attr("x", width / 2)
    .attr("y", -margin.top + 30)
    .style("text-anchor", "middle")
    .style("font-size", "24px")
    .text("Yearly Trends of NO2, O3, SO2, and CO in the US");

  // Legend
  const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 100},${margin.top})`); // Update the translate attribute

  const legendItems = legend.selectAll(".legend-item").data(pollutants).enter();

  legendItems
    .append("circle")
    .attr("class", (d) => d.name)
    .attr("cx", 0)
    .attr("cy", (d, i) => i * 20)
    .attr("r", 4)
    .attr("fill", (d) => colorScale(d.name));

  legendItems
    .append("text")
    .attr("class", "legend-label")
    .attr("x", 10)
    .attr("y", (d, i) => i * 20)
    .attr("dy", "0.35em")
    .text((d) => `${d.name} (${getUnit(d.name)})`); // Include units using the getUnit() function

  function getUnit(pollutant) {
    switch (pollutant) {
      case "NO2":
        return "0.01ppm";
      case "O3":
        return "10000ppm";
      case "SO2":
        return "0.1ppm";
      case "CO":
        return "1000ppm";
      default:
        return "";
    }
  }

  function handleMouseOver(event, d, i) {
    const selectedPath = d3.select(this);
    selectedPath.attr("stroke-width", 4);

    // Show tooltip
    const tooltip = d3.select("#tooltip");
    tooltip
      .style("visibility", "visible")
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY + 10 + "px");

    // Increase stroke width of the selected path
    selectedPath.attr("stroke-width", 6);
  }

  function handleMouseOut(d, i) {
    const selectedPath = d3.select(this);

    // Hide tooltip
    const tooltip = d3.select("#tooltip");
    tooltip.style("visibility", "hidden");

    // Restore stroke width of the selected path
    selectedPath.attr("stroke-width", 2);
  }
}


let question2 = function(data) {
  // Filter and process the data
  const filteredData = data.map(d => ({
      state: d.State,
      no2: d["NO2 Mean"] * 10, // Adjusted unit (e.g., ppb)
      o3: d["O3 Mean"] * 10000, // Adjusted unit (e.g., ppb)
      so2: d["SO2 Mean"] * 100, // Adjusted unit (e.g., ppb)
      co: d["CO Mean"] * 1000 // Adjusted unit (e.g., ppb)
  }));

  const groupedData = d3.groups(filteredData, d => d.state).map(([state, values]) => ({
      state: state,
      no2Mean: d3.mean(values, d => d.no2),
      o3Mean: d3.mean(values, d => d.o3),
      so2Mean: d3.mean(values, d => d.so2),
      coMean: d3.mean(values, d => d.co)
  }));
  
  groupedData.sort((a, b) => d3.ascending(a.state, b.state));

  // Set up the dimensions and margins of the plot
  const margin = { top: 100, bottom: 100, left: 60, right: 60 };
  const width = 800 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;

  const svg = d3.select("#q2_plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const xScale = d3.scaleBand()
      .domain(groupedData.map(d => d.state))
      .range([0, width])
      .padding(0.2);

  const yScale = d3.scaleLinear()
      .domain([0, d3.max(groupedData, d => d3.sum(Object.values(d)))])
      .range([height, 0]);

  const stack = d3.stack()
      .keys(["no2Mean", "o3Mean", "so2Mean", "coMean"])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

  const stackedData = stack(groupedData);

  const colorScale = d3.scaleOrdinal()
      .domain(["no2Mean", "o3Mean", "so2Mean", "coMean"])
      .range(["red", "green", "blue", "orange"]);

  const bars = svg.selectAll(".bar-group")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("fill", d => colorScale(d.key));

  bars.selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.data.state))
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

  // Add x-axis to the bar plot
  svg.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("dx", "-0.8em")
      .attr("dy", "-0.7em");

  // Add y-axis to the bar plot
  svg.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

  // Add labels, title, and legend
  // X-axis label
  svg.append("text")
      .attr("class", "x-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .style("text-anchor", "middle")
      .text("State");

  // Y-axis label
  svg.append("text")
      .attr("class", "y-label")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("transform", "rotate(-90)")
      .style("text-anchor", "middle")
      .text("Mean Pollution Level");

  // Title
  svg.append("text")
      .attr("class", "title")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .style("text-anchor", "middle")
      .style("font-size", "24px")
      .text("Distribution of Pollutants by State");

  // Create a legend
  const pollutants = [
      { name: "NO2", values: groupedData.map(d => ({ state: d.state, value: d.no2Mean })) },
      { name: "O3", values: groupedData.map(d => ({ state: d.state, value: d.o3Mean })) },
      { name: "SO2", values: groupedData.map(d => ({ state: d.state, value: d.so2Mean })) },
      { name: "CO", values: groupedData.map(d => ({ state: d.state, value: d.coMean })) }
  ];

  const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 100},${margin.top - 40})`);

  const legendItems = legend.selectAll(".legend-item")
      .data(pollutants)
      .enter();

  legendItems.append("circle")
      .attr("class", d => d.name)
      .attr("cx", 0)
      .attr("cy", (d, i) => i * 20)
      .attr("r", 4)
      .attr("fill", d => colorScale(d.name));

  legendItems.append("text")
      .attr("class", "legend-label")
      .attr("x", 10)
      .attr("y", (d, i) => i * 20)
      .attr("dy", "0.35em")
      .text(d => `${d.name} (${getUnit(d.name)})`);

  function getUnit(pollutant) {
      switch (pollutant) {
          case "NO2":
              return "0.01ppm";
          case "O3":
              return "10000ppm";
          case "SO2":
              return "0.1ppm";
          case "CO":
              return "1000ppm";
          default:
              return "";
      }
  }

  const tooltip = d3.select('body')
      .append('div')
      .style("opacity", 0)
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background-color", "white")
      .style("border", "1px solid black")
      .style("padding", "5px")
      .style("font-size", "12px")
      .style("font-weight", "bold");

  function handleMouseOver(event, d) {
      d3.select(this)
          .style("stroke", "black")
          .style("stroke-width", "2")
          .style("opacity", 1);

      const value = Math.round(d[1] - d[0]);
      tooltip
          .style("opacity", 1)
          .html(value)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
  }

  function handleMouseOut() {
      d3.select(this)
          .style("stroke", "none")
          .style("opacity", 0.8);

      tooltip.style("opacity", 0);
  }
}


let question3 = function(data) {
  // Filter data for the year 2016
  const filteredData = data.filter(d => d["Date Local"].getFullYear() === 2016);

  const o3MeanAvg = d3.mean(filteredData, d => d["O3 Mean"]);

  // Filter states with higher O3 Mean than average
  const higherO3MeanStates = filteredData.filter(d => d["O3 Mean"] > o3MeanAvg)
    .map(d => d.State)
    .filter((value, index, self) => self.indexOf(value) === index); // Get unique states

  // Filter states with lower O3 Mean than average
  const lowerO3MeanStates = filteredData.filter(d => d["O3 Mean"] < o3MeanAvg)
    .map(d => d.State)
    .filter((value, index, self) => self.indexOf(value) === index); // Get unique states

  const nodes = higherO3MeanStates.map(state => ({ id: state }))
    .concat(lowerO3MeanStates.map(state => ({ id: state }))); // Add both higher and lower O3 Mean states

  const links = [];

  // Create links between higher O3 Mean states
  for (let i = 0; i < higherO3MeanStates.length - 1; i++) {
    for (let j = i + 1; j < higherO3MeanStates.length; j++) {
      links.push({
        source: higherO3MeanStates[i],
        target: higherO3MeanStates[j]
      });
    }
  }

  // Create links between higher O3 Mean states and lower O3 Mean states
  higherO3MeanStates.forEach(higherState => {
    lowerO3MeanStates.forEach(lowerState => {
      links.push({
        source: higherState,
        target: lowerState
      });
    });
  });

  // Define the width and height of the SVG container
  const width = 800;
  const height = 600;

  // Create the SVG container
  const svg = d3.select("#q3_plot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Create a container for the visualization elements (nodes and links)
  const container = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`); // Center the container

  // Create a simulation with nodes and links
  const simulation = d3.forceSimulation(nodes)
    .force("charge", d3.forceManyBody().strength(-100))
    .force("link", d3.forceLink(links).id(d => d.id).distance(100)) // Increase edge length
    .force("center", d3.forceCenter(0, 0)) // Update center force coordinates
    .force("collision", d3.forceCollide().radius(10));

  // Create the links
  const link = container.selectAll(".link")
    .data(links)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke", "gray")
    .style("stroke-width", 1);

  // Create the nodes
  const node = container.selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node");

  // Add circles to represent the nodes
  node.append("circle")
    .attr("r", 5)
    .style("fill", "green");

  // Add text labels to display state names on nodes
  node.append("text")
    .attr("class", "node-label")
    .attr("text-anchor", "middle")
    .attr("dy", -10)
    .text(d => d.id);

  // Add titles for tooltips
  node.append("title")
    .text(d => d.id);

  // Apply zoom behavior to the SVG container
  const handleZoom = (event) => {
    container.attr("transform", event.transform);
  };
  const zoom = d3.zoom().on("zoom", handleZoom);
  svg.call(zoom);

  // Update node and link positions on each tick of the simulation
  simulation.on("tick", () => {
    link.attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node.attr("transform", d => `translate(${d.x},${d.y})`);
  });

  // Add title for the visualization
  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .text("Linked Nodes Visualization: Higher and Lower O3 Mean States");
}

let question4 = function (data) {
    // svg
    const margin = { top: 100, bottom: 100, left: 60, right: 120 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
  
    let svg = d3
      .select("#q4_plot")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    // filter data
    const filteredData = data.map((d) => ({
      state: d.State,
      no2: d["NO2 Mean"] * 10, // Adjusted unit (e.g., ppb)
      o3: d["O3 Mean"] * 10000, // Adjusted unit (e.g., ppb)
      so2: d["SO2 Mean"] * 100, // Adjusted unit (e.g., ppb)
      co: d["CO Mean"] * 1000, // Adjusted unit (e.g., ppb)
    }));
  
    const groupedData = d3.groups(filteredData, (d) => d.state).map(([state, values]) => ({
      state: state,
      no2Mean: d3.mean(values, (d) => d.no2),
      o3Mean: d3.mean(values, (d) => d.o3),
      so2Mean: d3.mean(values, (d) => d.so2),
      coMean: d3.mean(values, (d) => d.co),
    }));
  
    groupedData.sort((a, b) => d3.ascending(a.state, b.state));
  
    // convert state
    let stateAbbreviations = {
      Arizona: "AZ",
      Alabama: "AL",
      Alaska: "AK",
      Arkansas: "AR",
      California: "CA",
      Colorado: "CO",
      Connecticut: "CT",
      "Country Of Mexico": "MX",
      Delaware: "DE",
      "District Of Columbia": "DC",
      Florida: "FL",
      Georgia: "GA",
      Hawaii: "HI",
      Idaho: "ID",
      Illinois: "IL",
      Indiana: "IN",
      Iowa: "IA",
      Kansas: "KS",
      Kentucky: "KY",
      Louisiana: "LA",
      Maine: "ME",
      Maryland: "MD",
      Massachusetts: "MA",
      Michigan: "MI",
      Minnesota: "MN",
      Mississippi: "MS",
      Missouri: "MO",
      Montana: "MT",
      Nebraska: "NE",
      Nevada: "NV",
      "New Hampshire": "NH",
      "New Jersey": "NJ",
      "New Mexico": "NM",
      "New York": "NY",
      "North Carolina": "NC",
      "North Dakota": "ND",
      Ohio: "OH",
      Oklahoma: "OK",
      Oregon: "OR",
      Pennsylvania: "PA",
      "Rhode Island": "RI",
      "South Carolina": "SC",
      "South Dakota": "SD",
      Tennessee: "TN",
      Texas: "TX",
      Utah: "UT",
      Vermont: "VT",
      Virginia: "VA",
      Washington: "WA",
      "West Virginia": "WV",
      Wisconsin: "WI",
      Wyoming: "WY",
    };
  
    groupedData.forEach((item) => {
      item.state = stateAbbreviations[item.state] || item.state;
    });
  
    let maxPollutant = d3.max(groupedData, (d) => d.no2Mean + d.o3Mean + d.so2Mean + d.coMean);
  
    // logscale
    let colorScale = d3.scaleSequential(d3.interpolateBlues).domain([0, maxPollutant]);
  
    // projection
    let projection = d3.geoAlbersUsa().translate([width / 2, height / 2]).scale(800);
    let path = d3.geoPath().projection(projection);
  
    // US map
    d3.json("us-states.json").then(function (usMap) {
      svg
        .selectAll("path")
        .data(usMap.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", (d) => {
          let statePollutant = groupedData.find((item) => item.state === d.properties.name);
          if (statePollutant) {
            let pollutantSum = statePollutant.no2Mean + statePollutant.o3Mean + statePollutant.so2Mean + statePollutant.coMean;
            return colorScale(pollutantSum);
          } else {
            return "lightblue";
          }
        });
    });
  
    // color legend
    const legendWidth = 20;
    const legendHeight = height / 1.5;
    const legendPadding = 10;
  
    // color legend scale
    let legendScale = d3.scaleLinear().domain([0, maxPollutant]).range([legendHeight, 0]);
  
    // create color legend
    let legend = svg
  .append("g")
  .attr("class", "legend")
  .attr("transform", `translate(${width + margin.right - legendWidth - 20}, ${margin.top})`); // Adjusted x-coordinate

  // append color rectangles to the legend
  legend
    .selectAll(".legend-color")
    .data(d3.range(legendHeight), (d) => d)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d) => d)
    .attr("width", legendWidth)
    .attr("height", 1)
    .style("fill", (d) => colorScale(legendScale.invert(d)));

  // append legend title
  legend
    .append("text")
    .attr("class", "legend-title")
    .attr("x", legendWidth / 2 - 20)
    .attr("y", -legendPadding - 10)
    .attr("text-anchor", "middle")
    .text("Pollutant");

  // append legend min and max labels
  legend
    .append("text")
    .attr("class", "legend-label")
    .attr("x", legendWidth / 2 - 20)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .text(
      d3.max(groupedData, (d) => d.no2Mean + d.o3Mean + d.so2Mean + d.coMean)?.toFixed(2) || ""
    );

  legend
    .append("text")
    .attr("class", "legend-label")
    .attr("x", legendWidth / 2 - 20)
    .attr("y", legendHeight)
    .attr("text-anchor", "middle")
    .text(
      d3.min(groupedData, (d) => d.no2Mean + d.o3Mean + d.so2Mean + d.coMean)?.toFixed(2) || ""
    );

  // title
  svg
    .append("text")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .attr("font-size", "30px")
    .text("Distribution of Pollutants among States");
  }