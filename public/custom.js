/* global $*/
console.log("me connected");
$(document).ready(() => {
	console.log("loaded");
	$('a[href*="#"]') // Remove links that don't actually link to anything
		.not('[href="#"]')
		.not('[href="#0"]')
		.not('[href="#top"]')
		.click(function (event) {
			// On-page links
			// console.log(event);
			if (
				location.pathname.replace(/^\//, "") ==
					this.pathname.replace(/^\//, "") &&
				location.hostname == this.hostname
			) {
				// Figure out element to scroll to
				var target = $(this.hash);
				// console.log(target);
				target = target.length
					? target
					: $("[name=" + this.hash.slice(1) + "]");
				// Does a scroll target exist?
				if (target.length) {
					// Only prevent default if animation is actually gonna happen
					event.preventDefault();
					// console.log(target.offset().top - 50)
					$("html, body").animate(
						{
							scrollTop: target.offset().top - 80,
						},
						1000,
						function () {
							// Callback after animation
							// Must change focus!
							var $target = $(target);
							$target.focus();
							if ($target.is(":focus")) {
								// Checking if the target was focused
								return false;
							} else {
								$target.attr("tabindex", "-1"); // Adding tabindex for elements not focusable
								$target.focus(); // Set focus again
							}
						}
					);
				}
			}
		});
});

window.onscroll = function () {
	scrollFunction();
};

function scrollFunction() {
	if (
		document.body.scrollTop > 800 ||
		document.documentElement.scrollTop > 800
	) {
		document.getElementById("scrollTop").style.display = "block";
	} else {
		document.getElementById("scrollTop").style.display = "none";
	}
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
	// document.body.scrollTop = 0; // For Safari
	// document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
	window.scrollTo({
		top: 0,
		behavior: "smooth",
	});
}
