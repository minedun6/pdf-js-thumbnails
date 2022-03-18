// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window["pdfjs-dist/build/pdf"];
var worker = new pdfjsLib.PDFWorker();
var urls = [
  "https://pdftron.s3.amazonaws.com/downloads/pl/webviewer-demo.pdf",
  "https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf",
  "https://pdftron.s3.amazonaws.com/downloads/pl/magazine.pdf",
  "https://rawcdn.githack.com/PDFTron/webviewer-codesandbox-samples/a57eb371617e74cf0519a49e6ebf15ba08b57459/samples/files/cheetahs.pdf",
];

$(function () {
  urls.forEach((url, index) => {
    var wrapperEl = document.createElement("div");
    wrapperEl.classList.add("file-pages-wrapper");
    wrapperEl.id = `file-pages-wrapper-${index + 1}`;
    document.getElementById("pages").append(wrapperEl);
  });

  Promise.all(
    urls.map(function (url, index) {
      return getPdfPages(url, `file-pages-wrapper-${index + 1}`);
    })
  ).then(async (results) => {
    for (const pdf of results) {
      const index = results.indexOf(pdf);
      const filePagesWrapper = $("#file-pages-wrapper-" + (index + 1));

      for (var i = 1; i <= pdf.numPages; i++) {
        filePagesWrapper.append(
          '<div class="page-wrapper loading" data-page-number=' +
            i +
            ">" +
            '<span class="loader"></span>' +
            "<img />" +
            "</div>"
        );
      }

      for (let pageNumber in _.range(1, parseInt(pdf.numPages) - 1)) {
        constructPage(pdf, index, parseInt(pageNumber) + 1);
      }
    }
  });
});

function getPdfPages(url) {
  var loadingTask = pdfjsLib.getDocument({ url: url, worker: worker });

  // get progress data
  loadingTask.onProgress = function (data) {
    console.log("percentage : " + (data.loaded / data.total) * 100) ;
  };

  return loadingTask.promise
}

async function constructPage(pdf, fileID, pageNumber) {
  const filePagesWrapper = $("#file-pages-wrapper-" + (fileID + 1))

  pdf.getPage(pageNumber).then(async function (page) {
    var pageWrapper = filePagesWrapper.find(
      ".page-wrapper[data-page-number=" + pageNumber + "]"
    );
    var canvas = document.createElement("canvas");
    var scale;

    if (page.view[2] > page.view[3]) {
      scale = canvas.width / page.view[3];
    } else {
      scale = canvas.width / page.view[2];
    }

    var viewport = page.getViewport({ scale: scale });
    var context = canvas.getContext("2d");

    canvas.height = page.view[3] * scale;

    page
      .render({
        canvasContext: context,
        viewport: viewport,
      })
      .promise.then((_) => {
        var img = pageWrapper.find("img");

        img.attr("src", canvas.toDataURL());
        img.on("load", () => {
          setTimeout(() => img.parent().removeClass("loading"), 500);
        });
      });
  });
}

HTMLImageElement.prototype.waitToLoad = () => {
  return new Promise((resolve, reject) => {
    this.onload = resolve;
  });
};

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(resolve));
}
