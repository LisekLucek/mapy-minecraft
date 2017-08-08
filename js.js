//===== Deklaracja zmiennych =====//
var c = document.getElementById("mapa");
var canvasX = Math.floor(window.innerWidth / 2),
	canvasY = Math.floor(window.innerHeight / 2 - 128),
	oknoX = window.innerWidth,
	oknoY = window.innerHeight,
	myszX = 0,
	myszY = 0,
	kursorX = 0,
	kursorY = 0,
	skala = 1,
	przesuwanie = false,
	mapa,
	mapyJson,
	folderMap,
	maxOddalenie,
	doZaladowania = 0,
	idMapy = 0,
	idTrybu = 0;

var aktywnaMapa = false,
	zmianaLinku = false;
	
c.width = window.innerWidth;
c.height = window.innerHeight;

var ctx = c.getContext("2d");

//===== Pobieranie listy map =====//
$.getJSON("https://archiwum.lisekpl.net/mapy/mapy.json?v=" + new Date().getTime(), function(mapy)
{
	
	mapyJson = mapy;
	
	var mapaLink = window.location.hash.substr(1);
	
	WczytajZLinku(mapaLink);
	var html = "";
	
	for (i = 0; i < mapy.length; i++)
	{
		html = html + `
<div class="mapa">
<a href="#` + mapyJson[i].nazwaLink + `/` + mapyJson[i].wersje[0].nazwaLink + `">
<img src="` + mapy[i].ikona + `">
<h2>` + mapy[i].nazwa + `</h2>
</a>
</div>`;
	}
	
	$("#mapy").html(html);
});
//===== Wczytywanie z nazwy =====//
function WczytajZLinku(link)
{
	var mapaLink = link.split("/");
	
	if(mapaLink.length >= 2)
	{
		var idMapyLokalnie = -1;
		for(var i = 0; i < mapyJson.length; i++)
		{
			if (mapyJson[i].nazwaLink == mapaLink[0])
				idMapyLokalnie = i;
		}
		var idTrybuLokalnie = -1;
		for(var i = 0; i < mapyJson[idMapyLokalnie].wersje.length; i++)
		{
			if (mapyJson[idMapyLokalnie].wersje[i].nazwaLink == mapaLink[1])
				idTrybuLokalnie = i;
		}
		if (idMapyLokalnie != -1 && idTrybuLokalnie != -1)
		{
			WczyajMape(idMapyLokalnie, idTrybuLokalnie);
			return true;
		}
		else
		{
			return false;
		}	
	}
	else
	{
		return false;
	}
}
//===== Linki =====//
$(window).bind("hashchange", function(e)
{
	if(!zmianaLinku)
	{
		if(!WczytajZLinku(document.location.hash.substr(1)))
		{
			Zamknij();
		}
	}
	zmianaLinku = false;
});

//===== Uruchamianie Mapy =====//
function WczyajMape(mapa, tryb)
{
	idMapy = mapa;
	idTrybu = tryb;
	folderMap = mapyJson[mapa].wersje[tryb].pliki;
	canvasX = window.innerWidth / 2 - mapyJson[mapa].wersje[tryb].startX;
	canvasY = window.innerHeight / 2 - 128 - mapyJson[mapa].wersje[tryb].startY;
	maxOddalenie = mapyJson[mapa].wersje[tryb].maxZoom;
	skala = 1;
	
	var menuString = "";
	
	for(i = 0; i < mapyJson[mapa].wersje.length; i++)
	{
		menuString = menuString + '<a href="#' + mapyJson[mapa].nazwaLink + '/' + mapyJson[mapa].wersje[i].nazwaLink + '">' + mapyJson[mapa].wersje[i].nazwa + '</a><br>';
	}
	
	$(".menuTryb").html(menuString);
	
	$("h1").html("Minecraftowe Mapy: <span>" + mapyJson[mapa].nazwa + "</span>");
	
	$("#nieaktywnaMapa").css("visibility", "hidden");
	$("#aktywnaMapa").css("visibility", "visible");
	
	aktywnaMapa = true;
	Wczytaj();
}
//===== Zamykanie Mapy =====//
function Zamknij()
{
	$("h1").html("Minecraftowe Mapy");
	
	$("#nieaktywnaMapa").css("visibility", "visible");
	$("#aktywnaMapa").css("visibility", "hidden");
	$(".ladowanie").css("visibility", "hidden");
	aktywnaMapa = false;
}

//===== Wczytywanie Obrazu Na Canvas =====//
function WczytajObraz(pozX, pozY, rozmiar, oddalenie)
{
	if (oddalenie == null) oddalenie = 1;
	
	if		(oddalenie ==   1) var link = folderMap + Math.floor(pozX / 32) + "_" + Math.floor(-pozY / 32) + "/" + pozX + "_" + -pozY + ".png";
	else if (oddalenie ==   2) var link = folderMap + Math.floor(pozX / 32) + "_" + Math.floor(-pozY / 32) + "/z_" + pozX + "_" + -pozY + ".png";
	else if (oddalenie ==   4) var link = folderMap + Math.floor(pozX / 32) + "_" + Math.floor(-pozY / 32) + "/zz_" + pozX + "_" + -pozY + ".png";
	else if (oddalenie ==   8) var link = folderMap + Math.floor(pozX / 32) + "_" + Math.floor(-pozY / 32) + "/zzz_" + pozX + "_" + -pozY + ".png";
	else if (oddalenie ==  16) var link = folderMap + Math.floor(pozX / 32) + "_" + Math.floor(-pozY / 32) + "/zzzz_" + pozX + "_" + -pozY + ".png";
	else if (oddalenie ==  32) var link = folderMap + Math.floor(pozX / 32) + "_" + Math.floor(-pozY / 32) + "/zzzzz_" + pozX + "_" + -pozY + ".png";
	else if (oddalenie ==  64) var link = folderMap + Math.floor(pozX / 32) + "_" + Math.floor(-pozY / 32) + "/zzzzzz_" + pozX + "_" + -pozY + ".png";
	else if (oddalenie == 128) var link = folderMap + Math.floor(pozX / 32) + "_" + Math.floor(-pozY / 32) + "/zzzzzzz_" + pozX + "_" + -pozY + ".png";
	
	var img = new Image;
	img.crossOrigin = "anonymous";
	
	img.onload = function()
	{
		
		ctx.clearRect
		(
			(pozX * rozmiar + canvasX) /oddalenie,
			(pozY * rozmiar + canvasY) / oddalenie,
			rozmiar,
			rozmiar
		);
		
		ctx.drawImage
		(
			img,
			(pozX * rozmiar + canvasX) /oddalenie,
			(pozY * rozmiar + canvasY) / oddalenie,
			rozmiar,
			rozmiar
		);
		doZaladowania--;
		if (doZaladowania == 0) $(".ladowanie").css("visibility", "hidden");
	};
	img.onerror = function()
	{
		ctx.clearRect
		(
			(pozX * rozmiar + canvasX) /oddalenie,
			(pozY * rozmiar + canvasY) / oddalenie,
			rozmiar,
			rozmiar
		);
		doZaladowania--;
		if (doZaladowania == 0) $(".ladowanie").css("visibility", "hidden");
	};
	img.src = link;
}

//===== Wczytywanie widocznej mapy =====//
function Wczytaj ()
{
	zmianaLinku = true;
	document.location.replace ("#" + mapyJson[idMapy].nazwaLink + "/" + mapyJson[idMapy].wersje[idTrybu].nazwaLink + "/" + skala + "/" + canvasX + "/" + canvasY);
	
	$(".ladowanie").css("visibility", "visible");
	var czescX = Math.floor(-canvasX / 128 / skala),
		czescY = Math.floor(-canvasY / 128 / skala),
		czescXKoniec = Math.floor(-canvasX / 128 / skala + window.innerWidth / 128),
		czescYKoniec = Math.floor(-canvasY / 128 / skala + window.innerHeight / 128);
	
	var znacznikiHTML = "";
	for (i = 0; i < mapyJson[idMapy].wersje[idTrybu].znaczniki.length; i++)
	{
		znacznikiHTML = znacznikiHTML + '<div class="znacznik" style="left: ' + ((mapyJson[idMapy].wersje[idTrybu].znaczniki[i].x + canvasX) / skala - 16) + 'px; top: ' + ((mapyJson[idMapy].wersje[idTrybu].znaczniki[i].y + canvasY) / skala - 16) + 'px"><img src="' + mapyJson[idMapy].wersje[idTrybu].znaczniki[i].ikona + '" alt=""><div>' + mapyJson[idMapy].wersje[idTrybu].znaczniki[i].nazwa + '</div></div>';
	}
	$("#znaczniki").html(znacznikiHTML);
	
	for (iY = czescY; iY <= czescYKoniec; iY++)
		for (iX = czescX; iX <= czescXKoniec; iX++)
		{
			doZaladowania++;
			WczytajObraz(iX * skala, iY * skala, 128, skala);
		}
}

//===== Przesuwanie Myszy =====//
function przesuwanieMyszy(e)
{
	if (aktywnaMapa)
	{
		var przesuniecieX = parseInt(e.clientX - myszX),
			przesuniecieY = parseInt(e.clientY - myszY);
		
		kursorX = e.clientX;
		kursorY = e.clientY;
		
		if(przesuwanie)
		{
			ctx.clearRect(0, 0, c.width, c.height);
			ctx.putImageData(mapa, przesuniecieX, przesuniecieY);
			$("#znaczniki").css({top: (kursorY - myszY) + "px", left: (kursorX - myszX) + "px"});
		}
	}
}
//===== Rozpoczynianie przesuwania =====//
function startPrzesuwania(e)
{
	if(!przesuwanie && aktywnaMapa)
	{
		$("#mapa").css("cursor", "-webkit-grabbing");
		myszX = parseInt(e.clientX);
		myszY = parseInt(e.clientY);
		
		mapa = ctx.getImageData(0, 0, c.width, c.height);
		przesuwanie = true;
	}
}

//===== Kończenie przesuwania =====//
function koniecPrzesuwania(e)
{
	if(przesuwanie && aktywnaMapa)
	{
		$("#mapa").css("cursor", "-webkit-grab");
		canvasX += parseInt((e.clientX - myszX) * skala);
		canvasY += parseInt((e.clientY - myszY) * skala);
		
		przesuwanie = false;
		$("#znaczniki").css({top: "0", left: "0"});
		Wczytaj();
	}
}

$("#mapa").mousemove(function(e){przesuwanieMyszy(e);});
$("#mapa").mousedown(function(e){startPrzesuwania(e);});
$("#mapa").mouseup(function(e){koniecPrzesuwania(e);});
$("#mapa").mouseout(function(e){koniecPrzesuwania(e);});

//===== Scroll =====//
window.addEventListener('wheel', function(e)
{
	if (aktywnaMapa)
	{
		if (e.deltaY > 0)
		{
			Oddal(true);
		}
		else if (e.deltaY < 0)
		{
			Przybliz(true);
		}
	}
});
//===== Scroll Przyciski =====//
function Przybliz(mysz)
{
	if (skala > 1)
	{
		skala = skala / 2;
		
		var lokalnaSkala = skala;
		
		if(mysz)
		{
			canvasX -= kursorX * skala;
			canvasY -= kursorY * skala;
		}
		else
		{
			canvasX -= oknoX / 2 * skala;
			canvasY -= oknoY / 2 * skala;
		}
	
		if (skala <= 1)
		{
			$(".przyblizenie div:first-child").css({"color":"#ccc", "cursor":"default"});
			$(".przyblizenie div:last-child").css({"color":"black", "cursor":"pointer"});
		}
		else
		{
			$(".przyblizenie div").css({"color":"black", "cursor":"pointer"});
		}
		
		$("#skala").html("Skala 1:" + skala);
		$(".ladowanie").css("visibility", "visible");
		
		setTimeout(function ()
		{
			if (skala == lokalnaSkala)
				Wczytaj();
		}, 200)
	}
}
function Oddal(mysz)
{
	if (skala < maxOddalenie)
	{
		if (mysz)
		{
			canvasX += kursorX * skala;
			canvasY += kursorY * skala;
		}
		else
		{
			canvasX += oknoX / 2 * skala;
			canvasY += oknoY / 2 * skala;
		}
		skala = skala * 2;
		
		var lokalnaSkala = skala;
		
		if (skala >= maxOddalenie)
		{
			$(".przyblizenie div:last-child").css({"color":"#ccc", "cursor":"default"});
			$(".przyblizenie div:first-child").css({"color":"black", "cursor":"pointer"});
		}
		else
		{
			$(".przyblizenie div").css({"color":"black", "cursor":"pointer"});
		}
		
		$("#skala").html("Skala 1:" + skala);
		$(".ladowanie").css("visibility", "visible");
		
		setTimeout(function ()
		{
			if (skala == lokalnaSkala)
				Wczytaj();
		}, 200)
	}
	
}
//===== Zmiana rozmiaru okna =====//
window.addEventListener('resize', function ()
{
	canvasX -= (oknoX - window.innerWidth) / 2 * skala;
	canvasY -= (oknoY - window.innerHeight) / 2 * skala;
	
	c.width = window.innerWidth;
	c.height = window.innerHeight;
	
	oknoX = window.innerWidth;
	oknoY = window.innerHeight;
	
	if(aktywnaMapa)
		Wczytaj();
});