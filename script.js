// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window["pdfjs-dist/build/pdf"];
var worker = new pdfjsLib.PDFWorker();
var urls = [
    "ttps://d971obafjntio.cloudfront.net/zfn2vN/WKOTsm/d4587f31-2f0d-46b3-8fec-2dbd283ffd06.pdf?Expires=1647370682&Signature=F982adWL0bVPT1I-KqHgF4PbiL0Je4D3fG0qL4r9necshdv1jiDELKz8z8-AsoFWJwa6b051HPU7l3CwY1GFc5cBKCSGj2YUAEPD4SkAKlP8Fuh8bsEMpeYYJLZqAencBgKHFecI-7uAT11YVrPnFV6VWlL6OenguWimD-os7MZ2xiwrIZs6BM2dlLrYs~tZ1aNFackenVQULOXFuhjwbRRJddj~pw--mjscaz7ohr2T6hfdDB1hxcDrEdEKS7E4c8eAjcpAx~ol7oEoH-4q9F7XNfeqWmKCL-QSoXUH1bDVVSoNYvF1JxwjqCOu2oRa-4~rrMlxRgtXm6~~kdgmOg__&Key-Pair-Id=APKAIKIDYCUFHCVPHA2A",
    // "https://cors-anywhere.herokuapp.com/https://research.nhm.org/pdfs/10840/10840.pdf",
    // "https://cors-anywhere.herokuapp.com/https://www.hq.nasa.gov/alsj/a17/A17_FlightPlan.pdf",
];

$(function () {
    urls
        .forEach((url, index) => {
            var wrapperEl = document.createElement("div");
            wrapperEl.classList.add("file-pages-wrapper");
            wrapperEl.id = `file-pages-wrapper-${index + 1}`;
            document.getElementById("pages").append(wrapperEl);
        });

    Promise.all(
        urls.map(function (url, index) {
            return getPdfPages(url, `file-pages-wrapper-${index + 1}`);
        })
    ).then(async results => {
        for (const pdf of results) {
            const index = results.indexOf(pdf);
            const filePagesWrapper = $('#file-pages-wrapper-' + (index + 1));

            for (var i = 1; i <= pdf.numPages; i++) {
                filePagesWrapper.append(
                    '<div class="page-wrapper loading" data-page-number=' + i + '>' +
                    '<span class="loader"></span>' +
                    '<img />' +
                    '</div>'
                );
            }

            for (var j = 1; j <= pdf.numPages; j++) {

                await pdf.getPage(j)
                    .then(async function (page) {
                        var pageWrapper = filePagesWrapper.find('.page-wrapper[data-page-number=' + j + ']');
                        var canvas = document.createElement("canvas");
                        var scale;

                        if (page.view[2] > page.view[3]) {
                            scale = canvas.width / page.view[3];
                        } else {
                            scale = canvas.width / page.view[2];
                        }

                        var viewport = page.getViewport({scale: scale});
                        var context = canvas.getContext("2d");

                        canvas.height = page.view[3] * scale;

                        page
                            .render({
                                canvasContext: context,
                                viewport: viewport
                            })
                            .promise
                            .then(_ => {
                                var img = pageWrapper.find('img');

                                img.attr('src', canvas.toDataURL());
                                img.on('load', () => {
                                    setTimeout(() => img.parent().removeClass('loading'), 500)
                                })
                            });
                    });
            }
        }
    });
});

function getPdfPages(url) {
    return pdfjsLib.getDocument({
        url: url,
        worker: worker,
    }).promise;
}

HTMLImageElement.prototype.waitToLoad = () => {
    return new Promise((resolve, reject) => {
        this.onload = resolve
    })
}

function nextFrame() {
    return new Promise(resolve => requestAnimationFrame(resolve))
}
