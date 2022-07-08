import { useState, useEffect } from "react";
import Modal from 'react-modal'; 
import {PDFDownloadLink,Document,Page,Text,View,StyleSheet,Image,} from "@react-pdf/renderer";

const Main = () => {
  const url = "";
  const LogikToken ="";
  const threekitToken="";
  const assetId= "";
      
  let loaded = false; 
  Modal.setAppElement('#root');
  const [modalIsOpen, setIsOpen] = useState(false);
  const [snapshot,setSnapshot]=useState();
  const [UUUID, setUUUID] = useState();
  const [BOOM, setBoom] = useState({});
  const [cordageLength, setCordageLength] = useState({
    dataType: "",
    value: "",
    variableName: "",
  });
  const [style, setStyle] = useState({
    dataType: "",
    value: "",
    variableName: "",
  });
  const [material, setMaterial] = useState({
    dataType: "",
    value: "",
    variableName: "",
  });
  const [validQuote, setValidQuote] = useState(false);
  const [messages, setMessages] = useState({
    cordage: "",
    style: "",
    material: "",
    cordageClass: "",
    styleClass: "",
    materialClass: "",
  });

  const postData = async function () {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer "+LogikToken,
      },
      body: '{\n  "sessionContext": {\n    "stateful": true\n  },\n  "partnerData": {\n    "product": {\n      "configuredProductId": "OLF003"\n    }\n  },\n  "fields": [\n    {\n      "variableName": "string",\n      "value": "string"\n    }\n  ]\n}',
    })
      .then((response) => response.json())
      .then((data) => {
        setData(data);
      });
  };
  const setData = (data) => { 
    setUUUID(data.uuid);
    createVarObjNum(data, 5, setCordageLength);
    createVarObjName(data, "style", setStyle);
    createVarObjName(data, "material", setMaterial);
  };
  const createVarObjName = (data, name, fn) => {
    let newField = data.fields.find((x) => x.variableName === name);
    fn(newField);
  };
  const createVarObjNum = (data, num, fn) => {
    let newField = data.fields[num];
    fn(newField);
  };
  const updateValueLogik = async (varToUpdate) => {
    if (varToUpdate.variableName==="")
      return;
    let newData = {
      fields: [
        {
          variableName: varToUpdate.variableName,
          value: varToUpdate.value,
          dataType: varToUpdate.dataType,
        },
      ],
    };
    await fetch(url + UUUID, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer "+LogikToken,
      },
      body: JSON.stringify(newData),
    })
      .then((response) => response.json())
      .then((data) => {
        updatePatchLogikResponse(data);
      });
  };
  const updatePatchLogikResponse = (data) => { 
    //Fields
    for (let i = 0; i < data.fields?.length; i++) {
      let field = data.fields[i];
      if (field.variableName === "olf1_cordageLength_m") {
        setCordageLength((prev) => ({
          ...prev,
          value: field.value,
        }));
      }
      if (field.variableName === "material") {
        setMaterial((prev) => ({
          ...prev,
          value: field.value,
          optionSet: field.optionSet,
        }));
      }
    }
    //messages
    setMessages({
      cordage: "",
      style: "",
      material: "",
      cordageClass: "",
      styleClass: "",
      materialClass: "",
    });
    for (let i = 0; i < data.messages?.length; i++) {
      let mensaje = data.messages[i];
      if (mensaje.target === "olf1_cordageLength_m") {
        setMessages((prev) => ({
          ...prev,
          cordage: mensaje.message,
          cordageClass: mensaje.type,
        }));
      }
      if (mensaje.target === "material") {
        setMessages((prev) => ({
          ...prev,
          material: mensaje.message,
          materialClass: mensaje.type,
        }));
      }
    }
    //valid
    setValidQuote(data.valid);
  };
  const styles = StyleSheet.create({
    page: { flexDirection: "column", padding: 25 },
    table: {
      fontSize: 10,
      width: 550,
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      alignContent: "stretch",
      flexWrap: "nowrap",
      alignItems: "stretch"
    },
    row: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-around",
      alignContent: "stretch",
      flexWrap: "nowrap",
      alignItems: "stretch",
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: 35
    },
    cell: {
      borderColor: "white",
      borderStyle: "solid",
      borderWidth: 2,
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "auto",
      alignSelf: "stretch"
    },
    cellHeader: {
      borderColor: "#eee",
      borderStyle: "solid",
      borderWidth: 2,
      flexGrow: 1,
      flexShrink: 1,
      flexBasis: "auto",
      alignSelf: "stretch"
    },
    header: {
      backgroundColor: "#eee"
    },
    headerText: {
      fontSize: 11,
      fontWeight: 1200,
      color: "#1a245c",
      margin: 8
    },
    tableText: {
      margin: 10,
      fontSize: 10,
      color: "neutralDark"
    }
  });
  const MyDoc = () => (
    <Document>
      <Page style={styles.page} size="A4" wrap>
        <Text>Cognits - car wheel - quote</Text>
        <Text>   </Text> 
        <View style={styles.table}>
          <View style={[styles.row, styles.header]}>
              <Text style={[styles.headerText, styles.cellHeader]}>ID</Text>
              <Text style={[styles.headerText, styles.cellHeader]}>Description</Text>
              <Text style={[styles.headerText, styles.cellHeader]}>Quantity</Text>
              <Text style={[styles.headerText, styles.cellHeader]}>Amount</Text>
          </View>
          {BOOM.products?.map((item) => (
            <View style={styles.row}>
              <Text style={styles.cell}> {item.id}</Text>
              <Text style={styles.cell}>{item.description}</Text>
              <Text style={styles.cell}>{item.quantity}</Text>
              <Text style={styles.cell}>
                {" "}
                {`${
                  item.bomType === "SALES"
                    ? item.price * item.quantity
                    : item.rollUpPrice
                }`}{" "}
              </Text>
            </View>
          ))} 
          <View style={styles.row}>
            <Text style={styles.cell}></Text>
            <Text style={styles.cell}></Text>
            <Text style={styles.cell}>Total:</Text>
            <Text style={styles.cell}>{BOOM?.total}</Text>
          </View>
        </View>
        <Image src={snapshot} />
      </Page>
    </Document>
  );
  const requestQuote = async () => {
    await fetch(url + UUUID + "/bom/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: "Bearer "+LogikToken,
      },
    })
      .then((response) => response.json()) //revisar que sea status 200
      .then((data) => {  
        openModal();
        setBoom(data);   
      });
  };
  const handleChangeStyle = (e) => {
    setStyle((prev) => ({
      ...prev,
      value: e.target.value,
    }));
  };
  const handleChangeMaterial = (e) => {
    setMaterial((prev) => ({
      ...prev,
      value: e.target.value,
    }));
  };
  const initPlayer = async function () {
    const player = await window.threekitPlayer({
      assetId:assetId,
      authToken: threekitToken,
      el: document.getElementById("player-el"),
    });

    window.player = player;
    window.configurator = await player.getConfigurator();
  };
  function openModal() {
  
    window.player.snapshotAsync().then((value) => {
      setSnapshot( value);
    });
 
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
  } 
  useEffect(() => {
    if (!loaded) {
      postData();
      loaded = true;
      initPlayer();
    }
  }, []);
  useEffect(() => {
    updateValueLogik(cordageLength);
  }, [cordageLength]);
  useEffect(() => {
    window.configurator?.setConfiguration({ Style: style.value });
    updateValueLogik(style);
  }, [style]);
  useEffect(() => {
    updateValueLogik(material);
    window.configurator?.setConfiguration({
      Material: { assetId: material.value },
    });
  }, [material]); 
  return (
    <>
      <div className="container mx-auto px-4" id="container">
        <div className="shadow-lg" id="campos">
          <div className="columns: 1 h-20 flex justify-center">
            <h1 className="md:font-bold">CAR WHEEL</h1>
             <img alt="cognits" src="https://www.cognits.co/_next/static/image/assets/images/Logo/black/logo_black.e6d22562719e8f844321ede2133cb698.svg"></img> 
          </div>
          <div className="columns: 2 h-20">
            <div>
              <label>Quantity</label>
              <input
                type={cordageLength.dataType}
                name={cordageLength.variableName}
                value={cordageLength.value || ""}
                onChange={(e) =>
                  setCordageLength((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                className="border-2 border-blue-600"
              />
              <label className={messages.cordageClass}>
                {messages.cordage}
              </label>
            </div>

            <div></div>
          </div>
          <div className="columns: 2 h-20 ">
            <div>
              <label>Wheel</label>
              <select
                value={style.value}
                onChange={handleChangeStyle}
                id={style.variableName}
              >
                {style.optionSet?.options.map((item) => (
                  <option value={item.value} key={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <label>{messages.style}</label>
            </div>
            <div>
              <label>Material</label>
              <select
                value={material.value}
                onChange={handleChangeMaterial}
                id={material.variableName}
              >
                {material.optionSet?.options.map((item) => (
                  <option value={item.value} key={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <label className={messages.materialClass}>
                {messages.material}
              </label>
            </div>
          </div>
          <br />
          <div className="columns: 2 h-20">
            <input
              type="button"
              id="btnQuote"
              name="btnQuote"
              disabled={!validQuote}
              onClick={requestQuote}
              className={`${
                validQuote
                  ? "px-4 py-1 text-sm text-indigo-600 font-semibold rounded-full border border-indigo-200 hover:text-white hover:bg-indigo-600 hover:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                  : "px-4 py-1 text-sm text-grey-600 font-semibold rounded-full border border-grey-200 hover:text-black hover:bg-grey-600 focus:outline-none focus:ring-2 focus:ring-grey-600 focus:ring-offset-2 cursor-not-allowed "
              }`}
              value="Request Quote"
            />
            <Modal
              className="Modal"
              id="modal"
              name="modal"
              overlayClassName="Overlay"
              isOpen={modalIsOpen}
            >
              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  id="closModal2btn"
                  name="closModal2btn"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
    
              <div className="flex justify-between">
                <div>
                  <div className="columns: 6  font-bold"> Price Details</div>
                </div>
                <div className="columns: 6 flex justify-between">
                  <div>
                    {" "}
                    <button className="bg-grey-light hover:bg-grey text-grey-darkest font-bold py-2 px-4 rounded inline-flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                    </svg>{" "}
                      <span>Print</span>
                    </button> 
                    
                  </div>
                  <div>
                    {" "}
                    <PDFDownloadLink document={<MyDoc />} fileName="CognitsWheelQuote.pdf" className="bg-grey-light hover:bg-grey text-grey-darkest font-bold py-2 px-4 rounded inline-flex items-center">
                    <svg
                        className="w-4 h-4 mr-2"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                      >
                        <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                      </svg>
                      <span>Download</span>
                    </PDFDownloadLink>
                  </div>
                </div>
              </div>
              <hr className="divide-y divide-gray-900 "></hr>
              <br/>
              <div className="flex justify-end">
                <table className="divide-y divide-gray-400 table-fixed w-full ">
                {BOOM.products?.map((item) => (
                  <tr className="flex justify-between"> 
                    <td  >{item.description}</td>
                    <td> {`${
                       item.bomType==="SALES"? item.price*item.quantity: item.rollUpPrice}`}</td>
                  </tr>
                ))}
                </table>
              </div>
              <br/>
              <hr></hr>
              <div className="font-bold flex justify-end">  {BOOM?.total}</div>
            </Modal>
          </div>
        </div>
        <br />
        <div className="shadow-2xl">
          <div id="player-el" className="theekitCustom"></div>
        </div>
      </div>
    </>
  );
};

export default Main;
