/* eslint-disable max-len */
"use strict";
/**
 * @author Nihel Madani- Fouatih
 * @Version 2023-11-23
 */
!(function () {
    document.addEventListener("DOMContentLoaded", function () {

        const EpicApplication = {
            listOfImages : [],
            currentImageType : null,
            dateCache : {},
            imageCache : {}
        };

        const ImageTypes = Array.from(document.querySelectorAll("option")).map(opt => opt.value);

        EpicApplication.listOfImages = ImageTypes;
        EpicApplication.currentImageType = document.getElementById("type").value;
        ImageTypes.forEach( (key)=> {
            EpicApplication.dateCache[key] = null,
            EpicApplication.imageCache[key] = new Map();
        });
    
        const displayTime = document.getElementById("image-menu");
        const displayImage = document.getElementById("earth-image");
        const diplayImageTime = document.getElementById("earth-image-date");
        const displayImageCaption = document.getElementById("earth-image-title");
        const template = document.getElementById("image-menu-item");
        const calendar = document.getElementById("date");
        const imageType = document.getElementById("type");

        maxDate();
        imageType.addEventListener("input", maxDate);
    
        /**
     * @function maxDate
     * @description This function is gonna retrive the latest date available for 
     * an image Type and depending on if the  EpicApplication has it stored the date, will be generated 
     */
        function maxDate(){
            EpicApplication.currentImageType = imageType.value;
            const epicCachedDate = EpicApplication.dateCache[EpicApplication.currentImageType];
            if (!epicCachedDate){
                fetch(`https://epic.gsfc.nasa.gov/api/${EpicApplication.currentImageType}/all`, {})
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Not 2xx response", { cause: response });
                        }
                        return response.json();
                    })
                    .then((obj) => {
                        const recentDate = obj.sort((a, b) => b.date - a.date)[0].date;
                        calendar.setAttribute("max", recentDate);
                        EpicApplication.dateCache[EpicApplication.currentImageType] = recentDate;
                    })
                    .catch((err) => {
                        console.error("3Error:", err);
                    });
            }
        }
    
        document.getElementById("request_form")
            .addEventListener("submit", function (e){
                e.preventDefault();
                const retrivedInputImage = imageType.value;
                const retrivedInputDate = calendar.value;
                const cachedImages = EpicApplication.imageCache[retrivedInputImage].get(retrivedInputDate);
      
                if(cachedImages){
                    displayLiItems(cachedImages);
                }else{
                    fetch(`https://epic.gsfc.nasa.gov/api/${retrivedInputImage}/date/${retrivedInputDate}`, {})
                        .then((response) => {
                            if (!response.ok) {
                                throw new Error("Not 2xx response", { cause: response });
                            }
                            return response.json(); 
                        })
                        .then((obj) => {
                            displayTime.textContent = "";
                            if (obj.length === 0) {
                                displayErrorMsg();
                            } else {
                                const ImageArray = obj.map((elm) => ({ image: elm.image, caption: elm.caption, date: elm.date}));
                                EpicApplication.imageCache[retrivedInputImage].set(retrivedInputDate, ImageArray);
                                displayLiItems(ImageArray); 
                            }
                        })
                        .catch((err) => {
                            console.error("3)Error:", err);
                        });
                }
            });
  
  
        /**
   * @function displayErrorMsg
   * @description this function using a template generates an li 
   * that displays that no pictures were found (similar to error message)
   */
        function displayErrorMsg(){
            const clone = template.content.cloneNode(true);
            const li = clone.querySelector("li");
            li.textContent = "No pictures were found";
            displayTime.appendChild(clone);
        }

        /**
   * @function displayLiItems
   * @param {*} obj 
   * @description this function set the Li items with the date
   * on the page and set the Url Accordingly to the clicked Li Element
   */

        function displayLiItems(obj) {
            displayTime.textContent = " ";
  
            obj.forEach((elm, index) => {
                const clone = template.content.cloneNode(true);
                const li = clone.querySelector("li");
                li.children[0].textContent = elm.date;
                li.setAttribute("data-image-list-index", index);
                displayTime.appendChild(clone);
            });
  
            displayTime.addEventListener("click", (e) => {
          
                const index = e.target.closest("li").getAttribute("data-image-list-index");
                const selectedImage = obj[index];
                const date =  calendar.value.replace(/-/g, "/");
                const imageUrl = `https://epic.gsfc.nasa.gov/archive/${EpicApplication.currentImageType}/${date}/jpg/${selectedImage.image}.jpg`;
                displayImage.setAttribute("src", imageUrl);
                diplayImageTime.textContent = e.target.closest("li").textContent;
                displayImageCaption.textContent = selectedImage.caption;
            });
        }
    });
})();

       