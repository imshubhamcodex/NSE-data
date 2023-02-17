const csv = require("csv-parser");
const fs = require("fs");
const path = require("path");
const converter = require("json-2-csv");

execProcess();
setInterval(execProcess, 1 * 60 * 1000);

function execProcess() {
  let extractedDataCALL = [];
  let extractedDataPUT = [];
  let extractedDataPrice = [];
  let fileGenerationTime = [];
  let dataCall = [];
  let dataPut = [];
  let filenames = [];

  const currDir = path.join(__dirname + "/csvfile/");

  const readdir = (dirname) => {
    return new Promise((resolve, reject) => {
      fs.readdir(dirname, (error, filenames) => {
        if (error) {
          reject(error);
        } else {
          resolve(filenames);
        }
      });
    });
  };

  const filtercsvFiles = (filename) => {
    return filename.split(".")[1] == "csv";
  };

  const sortFilename = (filenames) => {
    const sortedFilename = [];
    filenames.forEach((file) => {
      let arrFile = file.split(" ");
      if (arrFile.length === 1) sortedFilename[0] = file;
      else {
        let iFile = Number(
          arrFile[1].split(".")[0].replaceAll("(", "").replaceAll(")", "")
        );
        sortedFilename[iFile] = file;
      }
    });

    return sortedFilename;
  };

  const extractTime = (filenames) => {
    filenames.forEach((file) => {
      let currFilePath = currDir + file;
      console.log(currFilePath);

      fs.stat(currFilePath, (err, stats) => {
        if (err) throw err;
        let time = stats.mtime.toString().split(" ")[4];
        fileGenerationTime.push(time);
      });
    });
  };

  readdir(currDir).then((filename) => {
    filenames = filename.filter(filtercsvFiles);

    filenames = [...sortFilename(filenames)];

    extractTime(filenames);

    read(filenames);
  });

  function setDataObj() {
    extractedDataPrice[0].forEach((price, index) => {
      let dataObj = {
        STRIKE_PRICE: price,
      };
      fileGenerationTime.forEach((ele, j) => {
        dataObj[ele] = extractedDataCALL[j][index];
      });
      dataCall.push(dataObj);
    });

    printCall();
    setDataObjPUT();
  }

  function setDataObjPUT() {
    extractedDataPrice[0].forEach((price, index) => {
      let dataObj = {
        STRIKE_PRICE: price,
      };
      fileGenerationTime.forEach((ele, j) => {
        dataObj[ele] = extractedDataPUT[j][index];
      });
      dataPut.push(dataObj);
    });

    printPut();
  }

  function printCall() {
    fs.unlink("./output/compiled-report-call.csv", function (err) {
      if (err) return console.log("No file found");
      console.log("Old compiled-report-call file deleted successfully");
    });

    converter.json2csv(dataCall, (err, csv) => {
      if (err) {
        throw err;
      }
      // console.log(csv);
      fs.writeFileSync(`output/compiled-report-call.csv`, csv);
    });
  }

  function printPut() {
    fs.unlink("./output/compiled-report-put.csv", function (err) {
      if (err) return console.log("No file found");
      console.log("Old compiled-report-put file deleted successfully");
    });

    converter.json2csv(dataPut, (err, csv) => {
      if (err) {
        throw err;
      }
      // console.log(csv);
      fs.writeFileSync(`output/compiled-report-put.csv`, csv);
    });
  }

  function readCSV(path) {
    return new Promise((resolve) => {
      let events = [];
      fs.createReadStream(path)
        .pipe(csv())
        .on("data", (row) => {
          events.push(row);
        })
        .on("end", () => {
          console.log(
            "CSV file successfully processed. Length: " + events.length
          );
          resolve(events);
        });
    });
  }

  function read(filenames) {
    const dataPromises = [];
    for (let i = 0; i < filenames.length; i++) {
      file = currDir + filenames[i];
      dataPromises.push(readCSV(file));
    }
    Promise.all(dataPromises).then((result) => {
      let item = 0;
      for (const events of result) {
        processCSV(events, item);
        item++;
      }
    });
  }

  function processCSV(results, item) {
    let callArr = [];
    let putArr = [];
    let priceArr = [];

    let resData = [];
    let indexArr = [];

    for (let i = 0; i < filenames.length; i++) {
      let rIndex = results.findIndex((ele) => ele.PUTS === "CHNG IN OI");
      if (rIndex !== -1) {
        results.splice(rIndex, 1);
        indexArr.push(rIndex);
      }
    }

    for (let j = 0; j < indexArr.length; j++) {
      let arr = [];
      if (j !== indexArr.length - 1) {
        arr = results.slice(indexArr[j], indexArr[j + 1]);
      } else {
        arr = results.slice(indexArr[j], indexArr[indexArr.length]);
      }
      resData.push(Array.from(arr));
    }

    Object.keys(resData[0]).forEach((key) => {
      let resObj = resData[0];
      let obj = resObj[key];
      callArr.push(obj.PUTS);
      putArr.push(obj._20);
      priceArr.push(obj._11);
    });

    extractedDataCALL[item] = callArr;
    extractedDataPUT[item] = putArr;
    extractedDataPrice[item] = priceArr;

    if (item === filenames.length - 1) {
      setDataObj();
    }
  }
}
